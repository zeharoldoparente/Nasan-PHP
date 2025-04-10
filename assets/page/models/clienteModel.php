<?php
class ClienteModel
{
   private $conn;

   public function __construct($connection)
   {
      $this->conn = $connection;
   }

   // Criar novo cliente
   public function criarCliente($dados)
   {
      $sql = "INSERT INTO clientes (
            razao_social, cpf_cnpj, inscricao_estadual, email, telefone, 
            cep, rua, numero, bairro, complemento, cidade, estado, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

      $stmt = $this->conn->prepare($sql);
      $stmt->bind_param(
         "sssssssssssss",
         $dados['empresa'],
         $dados['cnpj'],
         $dados['ie'],
         $dados['email'],
         $dados['telefone'],
         $dados['cep'],
         $dados['rua'],
         $dados['numero'],
         $dados['bairro'],
         $dados['complemento'],
         $dados['cidade'],
         $dados['estado'],
         $dados['observacoes']
      );

      if ($stmt->execute()) {
         return $this->conn->insert_id;
      } else {
         return false;
      }
   }

   // Listar todos os clientes
   public function listarClientes()
   {
      $sql = "SELECT * FROM clientes ORDER BY razao_social";
      $result = $this->conn->query($sql);
      return $result->fetch_all(MYSQLI_ASSOC);
   }

   // Obter cliente por ID
   public function getClientePorId($id)
   {
      $sql = "SELECT * FROM clientes WHERE id = ?";
      $stmt = $this->conn->prepare($sql);
      $stmt->bind_param("i", $id);
      $stmt->execute();
      $result = $stmt->get_result();
      return $result->fetch_assoc();
   }

   // Atualizar cliente
   public function atualizarCliente($id, $dados)
   {
      $sql = "UPDATE clientes SET 
            razao_social = ?, cpf_cnpj = ?, inscricao_estadual = ?, 
            email = ?, telefone = ?, cep = ?, rua = ?, numero = ?, 
            bairro = ?, complemento = ?, cidade = ?, estado = ?, 
            observacoes = ? WHERE id = ?";

      $stmt = $this->conn->prepare($sql);
      $stmt->bind_param(
         "sssssssssssssi",
         $dados['empresa'],
         $dados['cnpj'],
         $dados['ie'],
         $dados['email'],
         $dados['telefone'],
         $dados['cep'],
         $dados['rua'],
         $dados['numero'],
         $dados['bairro'],
         $dados['complemento'],
         $dados['cidade'],
         $dados['estado'],
         $dados['observacoes'],
         $id
      );

      return $stmt->execute();
   }

   // Excluir cliente
   public function excluirCliente($id)
   {
      $sql = "DELETE FROM clientes WHERE id = ?";
      $stmt = $this->conn->prepare($sql);
      $stmt->bind_param("i", $id);
      return $stmt->execute();
   }
}
