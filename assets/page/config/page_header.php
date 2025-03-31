<?php
// Armazena todo o conteúdo gerado até agora
$buffer = ob_get_contents();
ob_clean(); // Limpa o buffer sem desativá-lo

// Extrai o título do HTML
$page_title = "Página Sem Título";
if (preg_match('/<title>(.*?)<\/title>/i', $buffer, $matches)) {
   $page_title = trim($matches[1]);
}

// Reenvia o conteúdo original
echo $buffer;

// Adiciona o H1 com o título extraído
echo '<h1 class="page-title">' . htmlspecialchars($page_title) . '</h1>';
