<?php

class Usuario
{
   private $id;
   private $usuario;
   private $nome;
   private $senha;
   private $admin;
   private $ativo;
   private $conn;

   public function __construct($conn)
   {
      $this->conn = $conn;
   }

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

   public function getAtivo()
   {
      return $this->ativo;
   }

   public function setAtivo($ativo)
   {
      $this->ativo = $ativo;
   }

   public function listarTodos()
   {
      $sql = "SELECT id, usuario, nome, senha, admin, ativo FROM usuarios";
      $result = $this->conn->query($sql);

      $usuarios = [];

      if ($result->num_rows > 0) {
         while ($row = $result->fetch_assoc()) {
            $usuarios[] = $row;
         }
      }

      return $usuarios;
   }

   public function buscarPorId($id)
   {
      $sql = "SELECT id, usuario, nome, senha, admin, ativo FROM usuarios WHERE id = ?";
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
         $this->ativo = $dados['ativo'];
         return true;
      }

      return false;
   }

   public function criar()
   {
      $sql = "INSERT INTO usuarios (usuario, nome, senha, admin, ativo) VALUES (?, ?, ?, ?, ?)";
      $stmt = $this->conn->prepare($sql);

      $senhaHash = password_hash($this->senha, PASSWORD_DEFAULT);

      if ($this->ativo === null) {
         $this->ativo = 1;
      }

      $admin = intval($this->admin);
      $ativo = intval($this->ativo);

      $stmt->bind_param("sssii", $this->usuario, $this->nome, $senhaHash, $admin, $ativo);

      if ($stmt->execute()) {
         $this->id = $this->conn->insert_id;
         return true;
      }

      return false;
   }

   public function atualizar()
   {
      $admin = intval($this->admin);
      $ativo = intval($this->ativo);
      $id = intval($this->id);

      if (!empty($this->senha) && strlen($this->senha) < 60) {
         $sql = "UPDATE usuarios SET usuario = ?, nome = ?, senha = ?, admin = ?, ativo = ? WHERE id = ?";
         $stmt = $this->conn->prepare($sql);

         $senhaHash = password_hash($this->senha, PASSWORD_DEFAULT);

         $stmt->bind_param("sssiii", $this->usuario, $this->nome, $senhaHash, $admin, $ativo, $id);
      } else {
         $sql = "UPDATE usuarios SET usuario = ?, nome = ?, admin = ?, ativo = ? WHERE id = ?";
         $stmt = $this->conn->prepare($sql);
         $stmt->bind_param("ssiii", $this->usuario, $this->nome, $admin, $ativo, $id);
      }

      return $stmt->execute();
   }

   public function temPedidosAssociados($id)
   {
      $sql = "SELECT COUNT(*) as total FROM pedidos WHERE usuario_id = ?";
      $stmt = $this->conn->prepare($sql);
      $stmt->bind_param("i", $id);
      $stmt->execute();
      $result = $stmt->get_result();

      if ($result->num_rows > 0) {
         $row = $result->fetch_assoc();
         return $row['total'] > 0;
      }

      return false;
   }

   public function inativar($id)
   {
      $sql = "UPDATE usuarios SET ativo = 0 WHERE id = ?";
      $stmt = $this->conn->prepare($sql);
      $stmt->bind_param("i", $id);

      return $stmt->execute();
   }

   public function excluir($id)
   {
      try {
         if ($this->temPedidosAssociados($id)) {
            return $this->inativar($id);
         }

         $sql = "DELETE FROM usuarios WHERE id = ?";
         $stmt = $this->conn->prepare($sql);
         $stmt->bind_param("i", $id);

         return $stmt->execute();
      } catch (Exception $e) {
         error_log("Erro ao excluir usuário: " . $e->getMessage());
         return $this->inativar($id);
      }
   }
}
