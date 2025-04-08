<?php
// Arquivo: assets/page/controllers/UsuarioController.php

require_once __DIR__ . '/../models/Usuario.php';

class UsuarioController
{
   private $usuario;

   public function __construct($conn)
   {
      $this->usuario = new Usuario($conn);
   }

   // Processar as requisições AJAX
   public function processarRequisicao()
   {
      $acao = isset($_GET['acao']) ? $_GET['acao'] : '';

      switch ($acao) {
         case 'listar_usuarios':
            return $this->listarUsuarios();

         case 'obter_usuario':
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            return $this->obterUsuario($id);

         case 'criar_usuario':
            return $this->criarUsuario();

         case 'atualizar_usuario':
            return $this->atualizarUsuario();

         case 'excluir_usuario':
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            return $this->excluirUsuario($id);

         default:
            return json_encode(['erro' => 'Ação não reconhecida']);
      }
   }

   // Listar todos os usuários
   private function listarUsuarios()
   {
      $usuarios = $this->usuario->listarTodos();
      return json_encode($usuarios);
   }

   // Obter dados de um usuário específico
   private function obterUsuario($id)
   {
      if ($this->usuario->buscarPorId($id)) {
         return json_encode([
            'id' => $this->usuario->getId(),
            'usuario' => $this->usuario->getUsuario(),
            'nome' => $this->usuario->getNome(),
            'senha' => '', // Por segurança, não enviamos a senha
            'admin' => $this->usuario->getAdmin()
         ]);
      }

      return json_encode(['erro' => 'Usuário não encontrado']);
   }

   // Criar um novo usuário
   private function criarUsuario()
   {
      // Verificar se é uma requisição POST
      if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
         return json_encode(['erro' => 'Método não permitido']);
      }

      // Obter dados do POST
      $dados = json_decode(file_get_contents('php://input'), true);

      if (!$dados) {
         return json_encode(['erro' => 'Dados inválidos']);
      }

      // Validar dados obrigatórios
      if (empty($dados['usuario']) || empty($dados['nome']) || empty($dados['senha'])) {
         return json_encode(['erro' => 'Campos obrigatórios não preenchidos']);
      }

      // Definir valores
      $this->usuario->setUsuario($dados['usuario']);
      $this->usuario->setNome($dados['nome']);
      $this->usuario->setSenha($dados['senha']);
      $this->usuario->setAdmin(isset($dados['admin']) ? $dados['admin'] : 0);

      // Criar usuário
      if ($this->usuario->criar()) {
         return json_encode([
            'sucesso' => true,
            'mensagem' => 'Usuário criado com sucesso',
            'id' => $this->usuario->getId()
         ]);
      }

      return json_encode(['erro' => 'Erro ao criar usuário']);
   }

   // Atualizar um usuário existente
   private function atualizarUsuario()
   {
      // Verificar se é uma requisição PUT
      if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
         return json_encode(['erro' => 'Método não permitido']);
      }

      // Obter dados do POST
      $dados = json_decode(file_get_contents('php://input'), true);

      if (!$dados || !isset($dados['id'])) {
         return json_encode(['erro' => 'Dados inválidos']);
      }

      // Buscar usuário pelo ID
      if (!$this->usuario->buscarPorId($dados['id'])) {
         return json_encode(['erro' => 'Usuário não encontrado']);
      }

      // Atualizar valores
      if (isset($dados['usuario'])) $this->usuario->setUsuario($dados['usuario']);
      if (isset($dados['nome'])) $this->usuario->setNome($dados['nome']);
      if (!empty($dados['senha'])) $this->usuario->setSenha($dados['senha']);
      if (isset($dados['admin'])) $this->usuario->setAdmin($dados['admin']);

      // Atualizar usuário
      if ($this->usuario->atualizar()) {
         return json_encode([
            'sucesso' => true,
            'mensagem' => 'Usuário atualizado com sucesso'
         ]);
      }

      return json_encode(['erro' => 'Erro ao atualizar usuário']);
   }

   // Excluir um usuário
   private function excluirUsuario($id)
   {
      if ($this->usuario->excluir($id)) {
         return json_encode([
            'sucesso' => true,
            'mensagem' => 'Usuário excluído com sucesso'
         ]);
      }

      return json_encode(['erro' => 'Erro ao excluir usuário']);
   }
}
