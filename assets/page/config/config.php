 <?php
   $servidor = "sql206.infinityfree.com";
   $usuario = "if0_38802627";
   $senha = "VJLL7H68BiiYR";
   $banco = "if0_38802627_nasam";


   $conn = new mysqli($servidor, $usuario, $senha, $banco);


   if ($conn->connect_error) {
      die("Falha na conexão: " . $conn->connect_error);
   }
   ?>