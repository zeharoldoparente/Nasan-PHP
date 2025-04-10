<?php
require_once(__DIR__ . '/../models/clienteModel.php');
require_once(__DIR__ . '/../config/config.php');

class ClienteController
{
   private $clienteModel;

   public function __construct()
   {
      global $conn;
      $this->clienteModel = new ClienteModel($conn);
   }

   // Processar o formulário de cliente
   public function processarCliente()
   {
      if ($_SERVER['REQUEST_METHOD'] === 'POST') {
         // Validar campos obrigatórios
         $camposObrigatorios = [
            'empresa',
            'cnpj',
            'telefone',
            'cep',
            'rua',
            'numero',
            'bairro',
            'cidade',
            'estado'
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
            $resultado = $this->atualizarCliente($_POST['id'], $_POST);
         } else {
            $resultado = $this->cadastrarCliente($_POST);
         }

         return $resultado;
      }

      return [
         'sucesso' => false,
         'erros' => ['Método de requisição inválido']
      ];
   }

   // Cadastrar novo cliente
   private function cadastrarCliente($dados)
   {
      $id = $this->clienteModel->criarCliente($dados);

      if ($id) {
         return [
            'sucesso' => true,
            'mensagem' => 'Cliente cadastrado com sucesso!',
            'id' => $id
         ];
      } else {
         return [
            'sucesso' => false,
            'erros' => ['Erro ao cadastrar cliente']
         ];
      }
   }

   // Atualizar cliente existente
   private function atualizarCliente($id, $dados)
   {
      $resultado = $this->clienteModel->atualizarCliente($id, $dados);

      if ($resultado) {
         return [
            'sucesso' => true,
            'mensagem' => 'Cliente atualizado com sucesso!',
            'id' => $id
         ];
      } else {
         return [
            'sucesso' => false,
            'erros' => ['Erro ao atualizar cliente']
         ];
      }
   }

   // Listar todos os clientes
   public function listarClientes()
   {
      return $this->clienteModel->listarClientes();
   }

   // Obter cliente por ID
   public function getClientePorId($id)
   {
      return $this->clienteModel->getClientePorId($id);
   }

   // Excluir cliente
   public function excluirCliente($id)
   {
      $resultado = $this->clienteModel->excluirCliente($id);

      if ($resultado) {
         return [
            'sucesso' => true,
            'mensagem' => 'Cliente excluído com sucesso!'
         ];
      } else {
         return [
            'sucesso' => false,
            'erros' => ['Erro ao excluir cliente']
         ];
      }
   }
}
