<?php

require_once __DIR__ . '/../models/Usuario.php';

class UsuarioController
{
   private $usuario;

   public function __construct($conn)
   {
      $this->usuario = new Usuario($conn);
   }

   public function processarRequisicao()
   {
      try {
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
      } catch (Exception $e) {
         return json_encode(['erro' => 'Erro interno: ' . $e->getMessage()]);
      }
   }

   private function listarUsuarios()
   {
      $usuarios = $this->usuario->listarTodos();
      return json_encode($usuarios);
   }

   private function obterUsuario($id)
   {
      if ($this->usuario->buscarPorId($id)) {
         return json_encode([
            'id' => $this->usuario->getId(),
            'usuario' => $this->usuario->getUsuario(),
            'nome' => $this->usuario->getNome(),
            'senha' => '',
            'admin' => $this->usuario->getAdmin(),
            'ativo' => $this->usuario->getAtivo()
         ]);
      }

      return json_encode(['erro' => 'Usuário não encontrado']);
   }

   private function criarUsuario()
   {
      if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
         return json_encode(['erro' => 'Método não permitido']);
      }

      $dados = json_decode(file_get_contents('php://input'), true);

      if (!$dados) {
         return json_encode(['erro' => 'Dados inválidos']);
      }

      if (empty($dados['usuario']) || empty($dados['nome']) || empty($dados['senha'])) {
         return json_encode(['erro' => 'Campos obrigatórios não preenchidos']);
      }

      $this->usuario->setUsuario($dados['usuario']);
      $this->usuario->setNome($dados['nome']);
      $this->usuario->setSenha($dados['senha']);
      $this->usuario->setAdmin(isset($dados['admin']) ? intval($dados['admin']) : 0);
      $this->usuario->setAtivo(isset($dados['ativo']) ? intval($dados['ativo']) : 1);

      if ($this->usuario->criar()) {
         return json_encode([
            'sucesso' => true,
            'mensagem' => 'Usuário criado com sucesso',
            'id' => $this->usuario->getId()
         ]);
      }

      return json_encode(['erro' => 'Erro ao criar usuário']);
   }

   private function atualizarUsuario()
   {
      if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
         return json_encode(['erro' => 'Método não permitido']);
      }

      $dados = json_decode(file_get_contents('php://input'), true);

      if (!$dados || !isset($dados['id'])) {
         return json_encode(['erro' => 'Dados inválidos']);
      }

      if (!$this->usuario->buscarPorId($dados['id'])) {
         return json_encode(['erro' => 'Usuário não encontrado']);
      }

      if (isset($dados['usuario'])) $this->usuario->setUsuario($dados['usuario']);
      if (isset($dados['nome'])) $this->usuario->setNome($dados['nome']);
      if (!empty($dados['senha'])) $this->usuario->setSenha($dados['senha']);
      if (isset($dados['admin'])) $this->usuario->setAdmin(intval($dados['admin']));
      if (isset($dados['ativo'])) $this->usuario->setAtivo(intval($dados['ativo']));

      if ($this->usuario->atualizar()) {
         return json_encode([
            'sucesso' => true,
            'mensagem' => 'Usuário atualizado com sucesso'
         ]);
      }

      return json_encode(['erro' => 'Erro ao atualizar usuário']);
   }

   private function excluirUsuario($id)
   {
      try {
         if ($id <= 0) {
            return json_encode(['erro' => 'ID de usuário inválido']);
         }

         if ($id === 3) {
            return json_encode(['erro' => 'Este usuário não pode ser excluído']);
         }

         if ($this->usuario->temPedidosAssociados($id)) {
            if ($this->usuario->inativar($id)) {
               return json_encode([
                  'sucesso' => true,
                  'mensagem' => 'Usuário não pôde ser excluído devido a pedidos associados, mas foi inativado com sucesso.'
               ]);
            } else {
               return json_encode(['erro' => 'Não foi possível inativar o usuário']);
            }
         }

         if ($this->usuario->excluir($id)) {
            return json_encode([
               'sucesso' => true,
               'mensagem' => 'Usuário excluído com sucesso'
            ]);
         } else {
            return json_encode(['erro' => 'Não foi possível excluir o usuário']);
         }
      } catch (Exception $e) {
         return json_encode(['erro' => 'Erro ao excluir usuário: ' . $e->getMessage()]);
      }
   }
}
