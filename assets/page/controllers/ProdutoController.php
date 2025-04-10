<?php
require_once(__DIR__ . '/../models/produtoModel.php');
require_once(__DIR__ . '/../config/config.php');

class ProdutoController
{
   private $produtoModel;

   public function __construct()
   {
      global $conn;
      $this->produtoModel = new ProdutoModel($conn);
   }

   // Processar o formulário de produto
   public function processarProduto()
   {
      if ($_SERVER['REQUEST_METHOD'] === 'POST') {
         // Validar campos obrigatórios
         $camposObrigatorios = [
            'nome-produto',
            'unidade',
            'preco-venda'
         ];

         $erro = false;
         $erros = [];

         foreach ($camposObrigatorios as $campo) {
            if (empty($_POST[$campo])) {
               $erro = true;
               $erros[] = "O campo $campo é obrigatório.";
            }
         }

         if ($erro) {
            return [
               'sucesso' => false,
               'erros' => $erros
            ];
         }

         // Verificar se existe ID para atualização
         if (isset($_POST['id']) && !empty($_POST['id'])) {
            $resultado = $this->atualizarProduto($_POST['id'], $_POST);
         } else {
            $resultado = $this->cadastrarProduto($_POST);
         }

         return $resultado;
      }

      return [
         'sucesso' => false,
         'erros' => ['Método de requisição inválido']
      ];
   }

   // Cadastrar novo produto
   private function cadastrarProduto($dados)
   {
      $id = $this->produtoModel->criarProduto($dados);

      if ($id) {
         return [
            'sucesso' => true,
            'mensagem' => 'Produto cadastrado com sucesso!',
            'id' => $id
         ];
      } else {
         return [
            'sucesso' => false,
            'erros' => ['Erro ao cadastrar produto']
         ];
      }
   }

   // Atualizar produto existente
   private function atualizarProduto($id, $dados)
   {
      $resultado = $this->produtoModel->atualizarProduto($id, $dados);

      if ($resultado) {
         return [
            'sucesso' => true,
            'mensagem' => 'Produto atualizado com sucesso!',
            'id' => $id
         ];
      } else {
         return [
            'sucesso' => false,
            'erros' => ['Erro ao atualizar produto']
         ];
      }
   }

   // Listar todos os produtos
   public function listarProdutos()
   {
      return $this->produtoModel->listarProdutos();
   }

   // Obter produto por ID
   public function getProdutoPorId($id)
   {
      return $this->produtoModel->getProdutoPorId($id);
   }

   // Excluir produto
   public function excluirProduto($id)
   {
      $resultado = $this->produtoModel->excluirProduto($id);

      if ($resultado) {
         return [
            'sucesso' => true,
            'mensagem' => 'Produto excluído com sucesso!'
         ];
      } else {
         return [
            'sucesso' => false,
            'erros' => ['Erro ao excluir produto']
         ];
      }
   }
}
