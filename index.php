<!DOCTYPE html>
<html lang="pt-br">

<head>
   <meta charset="UTF-8" />
   <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
   <link
      href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet" />
   <link rel="stylesheet" href="styles/global.css" />
   <link rel="stylesheet" href="styles/login.css" />
   <link rel="icon" href="assets/image/logo.png" type="image/x-icon" />
   <title>Login</title>
</head>

<body>
   <div class="container">
      <div class="login-container">
         <h2>Entrar</h2>
         <?php if (isset($_GET['erro'])): ?>
            <p style="color: red; text-align: center; margin-bottom: 10px;">
               <?php
               $mensagem = "Usuário ou senha incorretos!";
               if ($_GET['erro'] == '2') {
                  $mensagem = "Usuário inativo. Entre em contato com o administrador.";
               }
               echo $mensagem;
               ?>
            </p>
         <?php endif; ?>
         <form action="assets/page/config/testLogin.php" method="POST">
            <input
               class="input"
               type="text"
               name="usuario"
               id="usuario"
               placeholder="Usuário"
               required />
            <input
               class="input"
               type="password"
               name="senha"
               id="senha"
               placeholder="Senha"
               required />
            <input
               class="inputSubmit"
               type="submit"
               name="submit"
               value="Entrar" />
         </form>
      </div>
      <div class="image-mobile">
         <img src="assets/image/logo.png" class="logo" alt="Logo">
         <img src="assets/image/nome.png" class="nome" alt="Nome">
      </div>
   </div>
</body>

</html>