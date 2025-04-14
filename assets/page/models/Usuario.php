<?php
// Arquivo: assets/page/models/Usuario.php

class Usuario
{
   private $id;
   private $usuario;
   private $nome;
   private $senha;
   private $admin;
   private $ativo; // Adicionado a propriedade ativo
   private $conn;

   public function __construct($conn)
   {
      $this->conn = $conn;
   }

   // Getters e Setters
   public function getId()
   {
      return $this->id;
   }

   public function setId($id)
   {
      $this->id = $id;
   }

   public function getUsuario()
   {
      return $this->usuario;
   }

   public function setUsuario($usuario)
   {
      $this->usuario = $usuario;
   }

   public function getNome()
   {
      return $this->nome;
   }

   public function setNome($nome)
   {
      $this->nome = $nome;
   }

   public function getSenha()
   {
      return $this->senha;
   }

   public function setSenha($senha)
   {
      $this->senha = $senha;
   }

   public function getAdmin()
   {
      return $this->admin;
   }

   public function setAdmin($admin)
   {
      $this->admin = $admin;
   }

   // Adicionado métodos getter e setter para ativo
   public function getAtivo()
   {
      return $this->ativo;
   }

   public function setAtivo($ativo)
   {
      $this->ativo = $ativo;
   }

   // Método para listar todos os usuários
   public function listarTodos()
   {
      $sql = "SELECT id, usuario, nome, senha, admin, ativo FROM usuarios"; // Adicionado campo ativo
      $result = $this->conn->query($sql);

      $usuarios = [];

      if ($result->num_rows > 0) {
         while ($row = $result->fetch_assoc()) {
            $usuarios[] = $row;
         }
      }

      return $usuarios;
   }

   // Método para buscar um usuário pelo ID
   public function buscarPorId($id)
   {
      $sql = "SELECT id, usuario, nome, senha, admin, ativo FROM usuarios WHERE id = ?"; // Adicionado campo ativo
      $stmt = $this->conn->prepare($sql);
      $stmt->bind_param("i", $id);
      $stmt->execute();
      $result = $stmt->get_result();

      if ($result->num_rows > 0) {
         $dados = $result->fetch_assoc();
         $this->id = $dados['id'];
         $this->usuario = $dados['usuario'];
         $this->nome = $dados['nome'];
         $this->senha = $dados['senha'];
         $this->admin = $dados['admin'];
         $this->ativo = $dados['ativo']; // Armazenar o valor de ativo
         return true;
      }

      return false;
   }

   // Método para criar um novo usuário
   public function criar()
   {
      $sql = "INSERT INTO usuarios (usuario, nome, senha, admin, ativo) VALUES (?, ?, ?, ?, ?)"; // Adicionado campo ativo
      $stmt = $this->conn->prepare($sql);

      // Encrypt the password with password_hash
      $senhaHash = password_hash($this->senha, PASSWORD_DEFAULT);

      // Se ativo não foi definido, definir como 1 (ativo) por padrão
      if ($this->ativo === null) {
         $this->ativo = 1;
      }

      $stmt->bind_param("sssii", $this->usuario, $this->nome, $senhaHash, $this->admin, $this->ativo);

      if ($stmt->execute()) {
         $this->id = $this->conn->insert_id;
         return true;
      }

      return false;
   }

   // Método para atualizar um usuário existente
   public function atualizar()
   {
      // Verificar se a senha foi alterada
      if (!empty($this->senha) && strlen($this->senha) < 60) { // Se não for um hash
         $sql = "UPDATE usuarios SET usuario = ?, nome = ?, senha = ?, admin = ?, ativo = ? WHERE id = ?"; // Adicionado campo ativo
         $stmt = $this->conn->prepare($sql);

         // Criptografar a senha
         $senhaHash = password_hash($this->senha, PASSWORD_DEFAULT);

         $stmt->bind_param("sssiii", $this->usuario, $this->nome, $senhaHash, $this->admin, $this->ativo, $this->id);
      } else {
         // Se a senha não foi alterada ou já é um hash
         $sql = "UPDATE usuarios SET usuario = ?, nome = ?, admin = ?, ativo = ? WHERE id = ?"; // Adicionado campo ativo
         $stmt = $this->conn->prepare($sql);
         $stmt->bind_param("ssiii", $this->usuario, $this->nome, $this->admin, $this->ativo, $this->id);
      }

      return $stmt->execute();
   }

   // Método para excluir um usuário
   public function excluir($id)
   {
      $sql = "DELETE FROM usuarios WHERE id = ?";
      $stmt = $this->conn->prepare($sql);
      $stmt->bind_param("i", $id);

      return $stmt->execute();
   }
}
