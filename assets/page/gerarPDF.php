<?php
ob_start();

session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

if (!isset($_GET['id']) || empty($_GET['id'])) {
   die("ID do pedido não fornecido");
}

$pedido_id = intval($_GET['id']);

include_once 'config/config.php';

$is_admin = false;
$usuario_id = null;
$usuario_logado = $_SESSION['usuario'];

$sql_user = "SELECT id, admin FROM usuarios WHERE usuario = ?";
$stmt_user = $conn->prepare($sql_user);
$stmt_user->bind_param("s", $usuario_logado);
$stmt_user->execute();
$result_user = $stmt_user->get_result();

if ($result_user->num_rows > 0) {
   $user_data = $result_user->fetch_assoc();
   $is_admin = $user_data['admin'] == 1;
   $usuario_id = $user_data['id'];
}
$stmt_user->close();

$sql_pedido = "SELECT p.*, c.razao_social as cliente_nome, c.cpf_cnpj as cliente_cnpj, 
                c.telefone as cliente_telefone, c.cidade as cliente_cidade, c.estado as cliente_estado,
                u.nome as vendedor_nome
                FROM pedidos p
                INNER JOIN clientes c ON p.cliente_id = c.id
                INNER JOIN usuarios u ON p.usuario_id = u.id
                WHERE p.id = ?";

$stmt_pedido = $conn->prepare($sql_pedido);
$stmt_pedido->bind_param("i", $pedido_id);
$stmt_pedido->execute();
$result_pedido = $stmt_pedido->get_result();

if ($result_pedido->num_rows === 0) {
   die("Pedido não encontrado");
}

$pedido = $result_pedido->fetch_assoc();
$stmt_pedido->close();

if (!$is_admin && $pedido['usuario_id'] != $usuario_id) {
   die("Você não tem permissão para visualizar este pedido");
}

$sql_itens = "SELECT ip.*, p.nome as produto_nome, p.codigo_barras as produto_codigo
              FROM itens_pedido ip
              INNER JOIN produtos p ON ip.produto_id = p.id
              WHERE ip.pedido_id = ?";

$stmt_itens = $conn->prepare($sql_itens);
$stmt_itens->bind_param("i", $pedido_id);
$stmt_itens->execute();
$result_itens = $stmt_itens->get_result();

$itens = [];
while ($item = $result_itens->fetch_assoc()) {
   $itens[] = $item;
}
$stmt_itens->close();

$total_itens = 0;
$valor_total_bruto = 0;
$valor_total_desconto = 0;

foreach ($itens as $item) {
   $total_itens += $item['quantidade'];
   $subtotal_bruto = $item['preco_unitario'] * $item['quantidade'];
   $valor_total_bruto += $subtotal_bruto;
   $valor_total_desconto += isset($item['valor_desconto']) ? $item['valor_desconto'] : 0;
}

$valor_total_liquido = $valor_total_bruto - $valor_total_desconto;

ob_end_clean();

require('fpdf/fpdf.php');
class PDF extends FPDF
{
   public $numero_pedido = '';
   public $data_pedido = '';

   function Header()
   {
      if (file_exists('logo.png')) {
         $this->Image('logo.png', 90, 10, 30);
      }
      $this->Ln(35);
      $this->SetFont('Arial', 'B', 16);
      $this->Cell(0, 10, utf8_decode('PEDIDO Nº ' . $this->numero_pedido), 0, 1, 'C');
      $this->SetFont('Arial', '', 10);
      if (!empty($this->data_pedido) && $this->data_pedido != '0000-00-00 00:00:00') {
         $data_formatada = date('d/m/Y', strtotime($this->data_pedido));
      } else {
         $data_formatada = date('d/m/Y');
      }
      $this->Cell(0, 5, utf8_decode('Data de emissão: ' . $data_formatada), 0, 1, 'C');

      $this->Ln(10);
   }
   function Footer()
   {
      $this->SetY(-15);
      $this->SetFont('Arial', 'I', 8);
      $this->Cell(0, 10, utf8_decode('Página ' . $this->PageNo() . ' de {nb}'), 0, 0, 'C');
   }
   function SetPedidoInfo($numero, $data)
   {
      $this->numero_pedido = $numero;
      $this->data_pedido = $data;
   }
   function AddClientInfo($pedido)
   {
      $this->SetFont('Arial', 'B', 12);
      $this->Cell(0, 8, utf8_decode('Dados do Cliente'), 0, 1, 'L');

      $this->SetFont('Arial', '', 10);
      $this->Cell(100, 6, utf8_decode('Nome: ' . $pedido['cliente_nome']), 0, 0, 'L');
      $this->Cell(90, 6, utf8_decode('CNPJ: ' . $pedido['cliente_cnpj']), 0, 1, 'L');

      $telefone = isset($pedido['cliente_telefone']) ? $pedido['cliente_telefone'] : 'Não informado';
      $cidade_uf = '';
      if (isset($pedido['cliente_cidade']) && isset($pedido['cliente_estado'])) {
         $cidade_uf = $pedido['cliente_cidade'] . '/' . $pedido['cliente_estado'];
      } else {
         $cidade_uf = 'Não informado';
      }

      $this->Cell(100, 6, utf8_decode('Telefone: ' . $telefone), 0, 0, 'L');
      $this->Cell(90, 6, utf8_decode('Cidade/UF: ' . $cidade_uf), 0, 1, 'L');

      $this->Ln(5);
      $this->SetFont('Arial', 'B', 12);
      $this->Cell(0, 8, utf8_decode('Dados do Pedido'), 0, 1, 'L');

      $this->SetFont('Arial', '', 10);
      $vendedor = isset($pedido['vendedor_nome']) ? $pedido['vendedor_nome'] : 'Não informado';
      $status = isset($pedido['status']) ? $pedido['status'] : 'Não informado';

      $this->Cell(100, 6, utf8_decode('Vendedor: ' . $vendedor), 0, 0, 'L');
      $this->Cell(90, 6, utf8_decode('Status: ' . $status), 0, 1, 'L');

      $transportadora = isset($pedido['transportadora']) ? $pedido['transportadora'] : 'Não informado';
      $forma_pagamento = isset($pedido['forma_pagamento']) ? $pedido['forma_pagamento'] : 'Não informado';

      $this->Cell(100, 6, utf8_decode('Transportadora: ' . $transportadora), 0, 0, 'L');
      $this->Cell(90, 6, utf8_decode('Forma de Pagamento: ' . $forma_pagamento), 0, 1, 'L');

      if (isset($pedido['observacoes']) && !empty($pedido['observacoes'])) {
         $this->Ln(3);
         $this->SetFont('Arial', 'B', 10);
         $this->Cell(0, 6, utf8_decode('Observações:'), 0, 1, 'L');
         $this->SetFont('Arial', '', 10);
         $this->MultiCell(0, 6, utf8_decode($pedido['observacoes']), 0, 'L');
      }

      $this->Ln(5);
   }
   function AddProductsTable($itens)
   {
      $header_fill_color = [240, 240, 240];
      $alt_row_color = [248, 248, 248];
      $this->SetFillColor($header_fill_color[0], $header_fill_color[1], $header_fill_color[2]);
      $this->SetFont('Arial', 'B', 10);
      $this->SetDrawColor(200, 200, 200);

      $w = [20, 85, 25, 18, 20, 25];

      $headers = ['Código', 'Nome', 'Valor Unitário', 'Qtd', 'Desconto', 'Valor Total'];
      for ($i = 0; $i < count($headers); $i++) {
         $align = ($i > 1) ? 'C' : 'L';
         if ($i == 0) $align = 'C';
         if ($i >= 2) $align = 'R';
         $this->Cell($w[$i], 10, utf8_decode($headers[$i]), 1, 0, $align, true);
      }
      $this->Ln();
      $this->SetFont('Arial', '', 9);
      $this->SetFillColor($alt_row_color[0], $alt_row_color[1], $alt_row_color[2]);

      $fill = false;
      $total_itens = 0;
      $valor_total_bruto = 0;
      $valor_total_desconto = 0;

      foreach ($itens as $k => $item) {
         $codigo = isset($item['produto_codigo']) && !empty($item['produto_codigo']) ? $item['produto_codigo'] : '';
         if (empty($codigo) && isset($item['produto_id'])) {
            $codigo = $item['produto_id'];
         }

         $nome_produto = isset($item['produto_nome']) ? $item['produto_nome'] : 'Produto sem nome';
         if (strlen($nome_produto) > 40) {
            $nome_produto = substr($nome_produto, 0, 37) . '...';
         }

         $valor_unitario = isset($item['preco_unitario']) ?
            'R$ ' . number_format($item['preco_unitario'], 2, ',', '.') : 'R$ 0,00';

         $quantidade = isset($item['quantidade']) ? $item['quantidade'] : 0;

         $desconto_percentual = isset($item['desconto_percentual']) ?
            number_format($item['desconto_percentual'], 2, ',', '.') . '%' : '0,00%';

         $subtotal_bruto = $item['preco_unitario'] * $quantidade;
         $valor_desconto = isset($item['valor_desconto']) ? $item['valor_desconto'] : 0;
         $subtotal_liquido = $subtotal_bruto - $valor_desconto;
         $subtotal_formatado = 'R$ ' . number_format($subtotal_liquido, 2, ',', '.');

         $this->Cell($w[0], 8, $codigo, 'LR', 0, 'C', $fill);
         $this->Cell($w[1], 8, utf8_decode($nome_produto), 'LR', 0, 'L', $fill);
         $this->Cell($w[2], 8, $valor_unitario, 'LR', 0, 'R', $fill);
         $this->Cell($w[3], 8, $quantidade, 'LR', 0, 'C', $fill);
         $this->Cell($w[4], 8, $desconto_percentual, 'LR', 0, 'C', $fill);
         $this->Cell($w[5], 8, $subtotal_formatado, 'LR', 0, 'R', $fill);
         $this->Ln();

         $fill = !$fill;

         $total_itens += $quantidade;
         $valor_total_bruto += $subtotal_bruto;
         $valor_total_desconto += $valor_desconto;
      }

      $this->Cell(array_sum($w), 0, '', 'T');
      $this->Ln(5);

      $valor_total_liquido = $valor_total_bruto - $valor_total_desconto;

      $this->SetFont('Arial', 'B', 11);
      $this->Cell(0, 8, utf8_decode('Resumo do Pedido'), 0, 1, 'L');
      $this->Ln(2);

      $this->SetFont('Arial', '', 10);
      $this->Cell(100, 7, utf8_decode('Quantidade de Itens: ' . $total_itens), 0, 1, 'L');

      $this->Cell(100, 7, utf8_decode('Total Bruto: R$ ' . number_format($valor_total_bruto, 2, ',', '.')), 0, 1, 'L');

      $this->SetTextColor(255, 0, 0);
      $this->Cell(100, 7, utf8_decode('Valor do Desconto: R$ ' . number_format($valor_total_desconto, 2, ',', '.')), 0, 1, 'L');

      $this->SetTextColor(0, 128, 0);
      $this->SetFont('Arial', 'B', 11);
      $this->Cell(100, 8, utf8_decode('Total Líquido: R$ ' . number_format($valor_total_liquido, 2, ',', '.')), 0, 1, 'L');

      $this->SetTextColor(0, 0, 0);
   }
}

$pdf = new PDF();

$pdf->SetPedidoInfo($pedido_id, isset($pedido['data_pedido']) ? $pedido['data_pedido'] : '');

$pdf->AliasNbPages();
$pdf->AddPage();
$pdf->AddClientInfo($pedido);
$pdf->AddProductsTable($itens);

$pdf->Output('Pedido_' . $pedido_id . '.pdf', 'D');
$conn->close();
