<?php
class Database
{
   private static $instance = null;
   private $conn;

   private function __construct()
   {
      $servidor = "localhost";
      $usuario = "root";
      $senha = "";
      $banco = "nasam";

      $this->conn = new mysqli($servidor, $usuario, $senha, $banco);

      if ($this->conn->connect_error) {
         die("Falha na conexão: " . $this->conn->connect_error);
      }

      // Configurar charset para UTF-8
      $this->conn->set_charset("utf8mb4");
   }

   public static function getInstance()
   {
      if (self::$instance == null) {
         self::$instance = new Database();
      }
      return self::$instance;
   }

   public function getConnection()
   {
      return $this->conn;
   }

   public function closeConnection()
   {
      if ($this->conn) {
         $this->conn->close();
         self::$instance = null;
      }
   }
}
