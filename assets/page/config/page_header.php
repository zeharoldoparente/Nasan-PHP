<?php
$buffer = ob_get_contents();
ob_clean();

$page_title = "Página Sem Título";
if (preg_match('/<title>(.*?)<\/title>/i', $buffer, $matches)) {
   $page_title = trim($matches[1]);
}

echo $buffer;

echo '<h1 class="page-title">' . htmlspecialchars($page_title) . '</h1>';
