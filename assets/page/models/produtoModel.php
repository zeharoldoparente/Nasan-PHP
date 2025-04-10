<?php
class ProdutoModel
{
   private $conn;

   public function __construct($connection)
   {
      $this->conn = $connection;
   }

   // Criar novo produto
   public function criarProduto($dados)
   {
      $sql = "INSERT INTO produtos (
            codigo_barras, nome, unidade, preco_venda
        ) VALUES (?, ?, ?, ?)";

      $stmt = $this->conn->prepare($sql);
      $stmt->bind_param(
         "sssd",
         $dados['codigo-barras'],
         $dados['nome-produto'],
         $dados['unidade'],
         $dados['preco-venda']
      );

      if ($stmt->execute()) {
         return $this->conn->insert_id;
      } else {
         return false;
      }
   }

   // Listar todos os produtos
   public function listarProdutos()
   {
      $sql = "SELECT * FROM produtos ORDER BY nome";
      $result = $this->conn->query($sql);
      return $result->fetch_all(MYSQLI_ASSOC);
   }

   // Obter produto por ID
   public function getProdutoPorId($id)
   {
      $sql = "SELECT * FROM produtos WHERE id = ?";
      $stmt = $this->conn->prepare($sql);
      $stmt->bind_param("i", $id);
      $stmt->execute();
      $result = $stmt->get_result();
      return $result->fetch_assoc();
   }

   // Atualizar produto
   public function atualizarProduto($id, $dados)
   {
      $sql = "UPDATE produtos SET 
            codigo_barras = ?, nome = ?, unidade = ?, preco_venda = ? 
            WHERE id = ?";

      $stmt = $this->conn->prepare($sql);
      $stmt->bind_param(
         "sssdi",
         $dados['codigo-barras'],
         $dados['nome-produto'],
         $dados['unidade'],
         $dados['preco-venda'],
         $id
      );

      return $stmt->execute();
   }

   // Excluir produto
   public function excluirProduto($id)
   {
      $sql = "DELETE FROM produtos WHERE id = ?";
      $stmt = $this->conn->prepare($sql);
      $stmt->bind_param("i", $id);
      return $stmt->execute();
   }
}
