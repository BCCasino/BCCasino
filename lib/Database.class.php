<?php
	/**
	 * DB Class - STATIC
	 * A static class to wrap mysql functions in an easy to use way.
	 * @author Andrew Hunt <ahuntdesign@gmail.com>
	 * @package StandardLib
	 * @version 1.0.0
	 */
	class DB {
		/**
		 * Holds the last query executed
		 * @var Resource
		 */
		private static $LastQuery;
		
		/**
		 * Holds the number of queries executed
		 * @var Integer
		 */
		private static $Queries = 0;
		
		/**
		 * Holds the total amount of time in microsends spent querying
		 * @var Float
		 */
		private static $Time = 0;
		
		/**
		 * Holds the current connection link identifier
		 * @var Resource
		 */
		private static $Connection;
		
		/**
		 * Connects to the database
		 * 
		 * @return Resource mysql link [persistant]
		 * @param $Host String Hostname:Port
		 * @param $Username String
		 * @param $Password String
		 * @param $Database String
		 * @param $Persistant Boolean[optional] Use a persistant connection?
		 */
		public static function Connect($Host, $Username, $Password, $Database, $Persistant = false) {
			$Func = "mysql_" . ($Persistant ? "p" : "") . "connect";
			$Connection = @$Func($Host, $Username, $Password);
			if (!$Connection)
				throw new Exception("Error connecting to database");
			self::SetConnection($Connection);
			self::SetDB($Database);
			return $Connection;
		}
		
		/**
		 * Disconnects from the database
		 * @return Null
		 */
		public static function Disconnect() {
			mysql_close(self::$Connection);
		}
		
		/**
		 * Standard mysql query in an easy to read way
		 * 
		 * Example Usage:
		 * <code>
		 * $Query = array(
		 * 		"SELECT"	=>	"*",
		 * 		"FROM		=>	"users",
		 * 		"WHERE		=>	"id = 1");
		 * $Return = DB::Query($Query);
		 * </code>
		 * 
		 * @return $QueryReturn Mixed Returns the result of mysql_query, a resource or boolean depending on query executed.
		 * @param $Query Array Array in format of example given
		 */
		public static function Query($Query) {
			$QueryString = '';
			foreach ($Query as $Key => $Value) {
				if (trim($Value) == '')
					$TempLine = " $Key ";
				else
					$TempLine = " $Key $Value ";
				$TempLine = trim($TempLine);
				$QueryString .= " $TempLine ";
			}
			$QueryString = trim($QueryString);
		//	echo $QueryString."<br />";
			$StartTime = microtime(true);
			$Query = mysql_query($QueryString, self::$Connection);
			$EndTime = microtime(true);
			self::$LastQuery = $Query;
			self::$Queries++;
			self::$Time += ($EndTime-$StartTime);
			return $Query;
		}
		
		/**
		 * An easy to use wrapper of the common insert query
		 * 
		 * Example Usage:
		 * <code>
		 * $Insert = array(
		 * 		"Name"		=>	"LeetHaxor123",
		 * 		"Password"	=>	"Password",
		 * 		"EMail"		=>	"leethaxor123@gmail.com");
		 * $Result = DB::Insert("Users", $Insert);
		 * </code>
		 * 
		 * @return Boolean True on succeeded, false on failed.
		 * @param $Table String Table to call the insert on
		 * @param $Insert Array Array formattated same way as in example
		 * @param $Sanitize[optional] Should the tables values you pass have their values automatically sanitized? Defaults to true
		 */
		public static function Insert($Table, $Insert, $Sanitize = true) {
			if ($Sanitize)
				$Insert = self::EscapeArray($Insert); //Clean values
			$Keys = array();
			foreach ($Insert as $K => $V)
				$Keys[] = $K;
			$Query = array(
				"INSERT INTO"	=>	sprintf("`$Table` (%s)", implode(", ", $Keys)),
				"VALUES"		=>	sprintf("('%s')", implode("', '", $Insert)));
			return self::Query($Query);
		}
		
		public static function CallStoredProc($Procedure, $Parameters, $Sanitize = true) {
			if ($Sanitize)
				$Parameters = self::EscapeArray($Parameters);
			$Query = array(
				"CALL"	=>	sprintf("%s ('%s')", $Procedure, implode("', '", $Parameters)));
			return DB::Query($Query);
		}
		
		/**
		 * Gets the number of queries executed
		 * @return Integer Number of queries
		 */
		public static function GetQueries() {
			return self::$Queries;
		}
		
		/**
		 * Gets the amount of time in microseconds spent querying
		 * @return Integer Time in microseconds
		 */
		public static function GetTime() {
			return self::$Time;
		}
		
		/**
		 * Get a row of data from a query
		 * @return Array
		 * @param $QueryReturn Resource Returned from a DB::Query call
		 * @param $Get Integer[optional] Defaults to MYSQL_ASSOC, can also be MYSQL_BOTH or MYSQL_NUM.
		 */
		public static function GetRow($QueryReturn, $Get = MYSQL_ASSOC) {
			self::Verify($QueryReturn);
			return mysql_fetch_array($QueryReturn, $Get);
		}
		
		/**
		 * Gets the number of rows returned from a query
		 * @return integer Number of rows
		 * @param $QueryReturn Resource Returned from a DB::Query call
		 */
		public static function GetRows($QueryReturn) {
			self::Verify($QueryReturn);
			return mysql_num_rows($QueryReturn);
		}
		
		/**
		 * Generates an efficient query to fetch the number of rows in a table
		 * @return Integer Number of rows in $Table
		 * @param $Table String What table will we be getting the number of rows for
		 */
		public static function GetRowsEasy($Table, $Override) {
			$Query = array(
				"SELECT"	=>	"count(*)",
				"FROM"		=>	"`$Table`");
			$Query = array_merge($Query, $Override);
			$Row = self::GetRow(self::Query($Query));
			self::FreeLastResult(self::$Connection);
			$Rows = $Row['count(*)'];
			return $Rows;
		}
		
		/**
		 * Gets the last insert id from an insert query into a table with an auto-incrementing primary key
		 * @return Integer Last Insert ID
		 */
		public static function GetLastID() {
			return mysql_insert_id(self::$Connection);
		}
		
		/**
		 * Retrieves the current mysql_error if any
		 * @return Mixed Error string or false if no error occured
		 */
		public static function GetError() {
			$Err = trim(mysql_error(self::$Connection));
			if ($Err != "")
				return $Err;
			return false;
		}
		
		/**
		 * Will sanitize a string to be safely used in a query
		 * @return String The escaped $In string
		 * @param $In String String to be escaped
		 */
		public static function Escape($In) {
			if (get_magic_quotes_gpc()) 
				$In = stripslashes($In);
			return mysql_real_escape_string($In, self::$Connection);
		}
		
		/**
		 * Will sanitize all the values in a 1-dimensional array that are a scalar
		 * @return Array Input array with escaped values
		 * @param $In Object
		 */
		public static function EscapeArray($In) {
			foreach ($In as &$V) {
				if (is_scalar($V))
					$V = self::Escape($V);
			}
			return $In;
		}
		
		/**
		 * Will free all memory associated with a DB::Query resource
		 * @return Boolean Whether the free result succeeded
		 * @param $QueryReturn Resource Returned from a DB::Query call
		 */
		public static function FreeResult($QueryReturn) {
			self::Verify($QueryReturn);
			return mysql_free_result($QueryReturn);
		}
		
		/**
		 * Frees all memory associated with the last run DB::Query
		 * @return Boolean Whether the free result succeeded
		 */
		public static function FreeLastResult() {
			return self::FreeResult(self::$LastQuery);
		}
		
		/**
		 * Sets the database on the current connection
		 * @return Boolean
		 * @param $DB String
		 */
		public static function SetDB($DB) {
			return mysql_select_db($DB, self::$Connection);
		}
		
		/**
		 * Change the current connection
		 * @return Boolean Success/Failure
		 * @param $Connection Resource mysql link [persistant]
		 */
		public static function SetConnection($Connection) {
			self::Verify($Connection, "link");
			self::$Connection = $Connection;
			return true;
		}
		
		/**
		 * Get the current connection
		 * @return Resource mysql link [persistant]
		 */
		public static function GetConnection() {
			return self::$Connection;
		}
		
		/**
		 * Called internally whenever the need to verify a valid query return should arise
		 * @return Null
		 * @param $Test Object
		 */
		private static function Verify($Test, $TestType = "result") {
			if ($Test === false || !is_resource($Test)) {
				$Type = strtolower(@get_resource_type($Test));
				$TestType = "mysql $TestType";
				if (substr($Type, 0, strlen($TestType)) != $TestType)
					throw new Exception("Expected resouce type '$TestType', got '$Type'");
			}
		}
	}
?>