<?php
	//Required function
	if (!function_exists('get_called_class')) { //Exists as of 5.3.0 :(
		function get_called_class() {
			$bt = debug_backtrace();
			$lines = file($bt[1]['file']);
			preg_match('/([a-zA-Z0-9\_]+)::'.$bt[1]['function'].'/',
				$lines[$bt[1]['line']-1],
				$matches);
			return $matches[1];
		}
	}
	/**
	 * Base Class
	 * A handy base class which can be extended nicely into specialized classes.
	 * Features query caching to reduce the number of queries required
	 * @author Andrew Hunt <ahuntdesign@gmail.com>
	 * @package StandardLib
	 */
	class Base {
		/**
		 * The table to which we will query
		 * @var String
		 */
		private $Table;
		
		/**
		 * The child class which extends from base
		 * @var Object
		 */
		private $_Child;
		
		/**
		 * The primary key of the table
		 * @var String
		 */
		private $_Key;
		
		/**
		 * Does the primary key of this table auto-increment?
		 * @var Boolean
		 */
		private $_Key_Auto = false;
		
		/**
		 * Associative array following structure of table
		 * @var Array
		 */
		private $_Info = array();
		
		/**
		 * Sets whether the base class should save on destruct.
		 * Setting this allows you to avoid having to call a save method.
		 * This will only save if there have been changes made.
		 * @var Boolean
		 */
		public $_SaveOnDestruct = false;
		
		/**
		 * The ID of the last inserted item
		 * @var int
		 */
		public $_LastInsertID = -1;
		
		/**
		 * Informs the class internally if there have been any changes made to the values
		 * @var Boolean
		 */
		private $_Changed = false;
		
		/**
		 * The elements that have been changed
		 * @var Array
		 */
		private $_ChangedKeys = array();
		
		
		/**
		 * Is this to be a new entry in the table?
		 * @var Boolean
		 */
		private $_New = false;
		
		
		/**
		 * If your table is a view and you wish to delete from a certain table only use the master table, must have same primary key as view!
		 * @var Variant
		 */
		private $_MasterTable = false;
		
		/**
		 * Static cache array for all of the base classes to access
		 * @var Array
		 */
		private static $Cache = array();
		
		/**
		 * Analyizes the table structure of the table passed and retrieves the row based on the primary key reference passed.
		 * If an ID is passed and there are no results returned it will throw an exception
		 * @return Void
		 * @param $ID Mixed Primary Key value to search for
		 * @param $Child Object A reference to the child which is using base as its parent
		 * @param $Row Array[optional] If set, will use this passed array to set values on the object instead of doing a query
		 */
		public function __construct($ID, &$Child, $Row = false, $Table, $MasterTable = false) {
		
			$this->_Child = $Child;
			$this->Table = $Table;
			$this->_MasterTable = $MasterTable;
			self::Cache_Setup($this->Table); //Initialize the cache
			$this->SetTable($this->Table, $this);
			if ($this->_MasterTable) {
				$Temp = new BaseTempClass($this->_MasterTable);
				$this->_Key = $Temp->_Key;
				unset($Temp);
			}
			$R = self::Cache_GetRow($this->Table, $ID); //Check Cache

			if ($Row) {
				$this->AssignValues($Row);
			} elseif ($ID) {
				if ($R) {
					$this->AssignValues($R);
				} else {
					$S_ID = DB::Escape($ID);
					$Query = array(
						"SELECT"	=>	"*",
						"FROM"		=>	$this->Table);
					if($this->_Key)
						$Query["WHERE"] = $this->_Key . " = '$S_ID'";
					$Return = DB::Query($Query);
					$Rows = DB::GetRows($Return);
					if ($Rows <= 0) {
						throw new Exception("Unable to find row with that key.");
					} else {
						$Row = DB::GetRow($Return);
						self::Cache_SetRow($this->Table, $ID, $Row);
						$this->AssignValues($Row);
					}
				}
			}
			if (!$Row && !$ID)
				$this->_New = true;
		}
		
		/**
		 * Will automatically save the table if saveondestruct is true and if any values have changed
		 * @return Void
		 */
		public function __destruct() {
			if ($this->_SaveOnDestruct && $this->_Changed)
				$this->Save_In();
		}
		
		/**
		 * Analyzes the table passed to identify columns and primary key
		 * @return Void
		 * @param $Table String Table to use
		 */
		private static function SetTable($Table, $Instance) {
			//Check Cache
			self::Cache_Setup($Table); //Initialize the cache
			$S = self::Cache_GetStruct($Table);
			if ($S) {
				$K = self::Cache_GetKey($Table);
				if ($K) {
					$Instance->_Info = $S;
					$Instance->_Key = $K[0];
					$Instance->_Key_Auto = $K[1];
					return;
				}
			}
			$Return = DB::Query(array("SHOW COLUMNS FROM" => $Table));

			while ($Row = DB::GetRow($Return)) {
				$F = $Row['Field'];
				$Instance->_Info[$F] = null;
				if ($Row["Key"] == "PRI") {
					$Instance->_Key = $F;
					if ($Row["Extra"] == "auto_increment")
						$Instace->_Key_Auto = true;
				}
			}
			self::Cache_SetStruct($Table, $Instance->_Info);
			self::Cache_SetKey($Table, array($Instance->_Key, $Instance->_Key_Auto));
		}
		
		/**
		 * Helpful command will output the structure of the table
		 * @return Void
		 */
		public static function DumpStructure() {
			$Instance = get_called_class();
			$Class = new ReflectionClass($Instance);
			$Table = $Class->getStaticPropertyValue("Table");
			$T = new stdClass();
			$T->_Info = array();
			self::SetTable($Table, $T);
			foreach ($T->_Info as $K => $V) {
				if ($K == $T->_Key)
					echo "PRIMARY KEY - ";
				echo "$K<br />";
			}
		}
		
		/**
		 * Takes an associative array from a query return and puts it into the objects memory.
		 * If the array you pass is missing an expected column an exception will be raised.
		 * @return Void
		 * @param $Row Array Associative array from a DB::Query
		 */
		private function AssignValues($Row) {
			foreach ($this->_Info as $Key => $Z) {
				if (!array_key_exists($Key, $Row))
					throw new Exception("Passed row missing expected key: $Key.");
				else
					$this->_Info[$Key] = $Row[$Key];
			}
		}
		
		/**
		 * What does this do? Please document for the benefit of others!
		 */
		public function AddData($TableAdd) {
		
			$this->_Info = array_merge($this->_Info, $TableAdd);
		
		}
		
		/**
		 * Retrieves the value with the passed key
		 * @return Scalar
		 * @param $Key Scalar
		 */
		public function Get($Key) {
			return $this->_Info[$Key];
		}
		
		/**
		 * Will set the column value to the one passed. If you try to change the
		 * primary key value or if you try to set a non-existant key an exception will be thrown.
		 * 
		 * An additional feature of this method is that when you set a value and the child class
		 * has a method named ValSan_$Key, key being the column's value you are setting, the method
		 * will be called with the value passed to it. In the ValSan method you are able to validate
		 * and sanitize (not mysql escape) the value before it is put into the array. Should the ValSan
		 * method get called you must return an instance of the Validator class which facilitates
		 * error handling between the two methods. It is very important that you call this method
		 * in a try/catch structure because if the Validator class reports an error it will throw an exception.
		 * 
		 * @return Boolean Whether it set successfully
		 * @param $Key Scalar
		 * @param $Value Scalar
		 */
		public function Set($Key, $Value) {
		
			if ($Key == $this->_Key && $this->_Key_Auto) {
				throw new Exception("Attempting to change primary key ($Key) value");
				return false;
			} elseif (!array_key_exists($Key, $this->_Info)) {
				throw new Exception("Attempting to set value on non-existant column ($Key)");
				return false;
			} else {
				$Func = "ValSan_$Key";
				if (method_exists($this->_Child, $Func)) {
					$Res = $this->_Child->$Func($Value);
					if ($Res instanceof Validator) {
						if ($Res->GetError()) {
							throw new Exception($Res->GetError());
							return false;
						} else {
							$Value = $Res->GetValue(); //Validated and sanitized in the function ValSan_XXX
						}
					} else
						$Value = $Res;
				}
				if(!$this->_New){
					$this->_ChangedKeys[$Key] = true;
				}
				$this->_Info[$Key] = $Value;
				$this->_Changed = true;
				return true;
			}
			
		}
		
		/**
		 * 
		 * @param object $Key
		 * @param object $Value
		 * @return 
		 */
		public function Add($Key, $Value) {
			$this->Set($Key, $this->Get($Key)+$Value);
		}
		
		/**
		 * Updates all of the values, as well as escapes them automatically.
		 * @return Resource The mysql result resource upon success
		 */
		public function Save() {
			if (!$this->_SaveOnDestruct)
				return $this->Save_In();
			else
				throw new Exception("Tried to save when save on destruct is enabled");
		}
		
		/**
		 * Internal saving function
		 * @return Mixed If not a new row, will return a mysql result other wise will return boolean reporting success/failure
		 */
		private function Save_In() {
		
			$Table = $this->Table;
			if ($this->_MasterTable)
				$Table = $this->_MasterTable;
			
			if ($this->_New) {

				$Values = array_diff_key($this->_Info, array($this->_Key => true));

				if (!$this->_Key_Auto)
					$Values = $this->_Info;
				foreach ($Values as $K => $V) {
					if ($V == null)
						unset($Values[$K]);
				}


				$Res = DB::Insert($Table, $Values);
				$this->_LastInsertID = DB::GetLastID();
				$this->_Info[$this->_Key] = $this->_LastInsertID;
				$this->_New = false;
				return $Res;
			} else {
				$Sets = DB::EscapeArray(array_diff_key($this->_Info, array($this->_Key => true)));
				$Sets = array_intersect_key($Sets, $this->_ChangedKeys);
				$Set = "";
				$i = 1;
				$Max = count($Sets);
				foreach ($Sets as $K => $V) {
					$Set .= "`$K` = '$V'";
					if ($i < $Max)
						$Set .= ", ";
					$i++;
				}
					
				$Query = array(
					"UPDATE"	=>	"`" . $Table . "`",
					"SET"		=>	$Set,
					"WHERE"		=>	$this->_Key . " = '" . DB::Escape($this->_Info[$this->_Key]) . "'");
				$Return = @DB::Query($Query);
				if (DB::GetError())
					throw new Exception("A database error occurred");
				return $Return;
			}
		}
		
		/**
		 * Will delete the current entry from the database
		 * @return Mysql Result
		 */
		public function Delete() {
			if ($this->_New)
				throw new Exception("Attempted to delete a new record before it was saved");
			$Table = $this->Table;
			$Key = $this->_Key;
			if ($this->_MasterTable)
				$Table = $this->_MasterTable;
			$Query = array(
				"DELETE FROM"	=>	"`" . $Table . "`",
				"WHERE"			=>	"`$Key` = '" . DB::Escape($this->_Info[$Key]) . "'");
			$Return = @DB::Query($Query);
			if (DB::GetError())
					throw new Exception("A database error occurred");
			return $Return;
		}
		
		//Static Methods
		/**
		 * Builds a query to grab a bunch of rows from the instance's table.
		 * Takes each row to create a new instance of the passed instance.
		 * @return Array Array of instances of the objects you requested
		 * @param $Instance String Class to use - Must extend from base and follow format
		 * @param $Override Array[optional] Any additional query parameters
		 */
		public static function Find($Override = array()) {
			$Instance = get_called_class();
			$Class = new ReflectionClass($Instance);
			$Table = $Class->getStaticPropertyValue("Table");
			$Query = array(
				"SELECT"	=>	"*",
				"FROM"		=>	"`$Table`");
				
			$Query = array_merge($Query, $Override);
			$Return = DB::Query($Query);
			$Out = array();
			while ($Row = DB::GetRow($Return)) {
				$Out[] = new $Instance(false, $Row);
			}
			return $Out;
		}
		
		/**
		 * Find the number of rows for this table
		 * @return integer Number of rows
		 * @param array $Override[optional] Additional query parameters to filter the row count result by
		 */
		public static function GetRowCount($Override = array()) {
			$Instance = get_called_class();
			$Class = new ReflectionClass($Instance);
			$Table = $Class->getStaticPropertyValue("Table");
			return DB::GetRowsEasy($Table, $Override);
		}
		
		//Internal Caching Methods - NO DOCUMENTATION
		private static function Cache_Setup($Table) {
			if (!self::Cache_Exists($Table))
				self::$Cache[$Table] = array(
					"Key"			=>	false,
					"Structure"		=>	array(),
					"Rows"			=>	array());
		}
		private static function Cache_Exists($Table) {
			return array_key_exists($Table, self::$Cache);
		}
		private static function Cache_GetKey($Table) {
			return self::$Cache[$Table]["Key"];
		}
		private static function Cache_SetKey($Table, $Key) {
			self::$Cache[$Table]["Key"] = $Key;
		}
		private static function Cache_GetStruct($Table) {
			$S = self::$Cache[$Table]["Structure"];
			if (count($S) > 0)
				return $S;
			return false;
		}
		private static function Cache_SetStruct($Table, $Struct) {
			self::$Cache[$Table]["Structure"] = $Struct;
		}
		private static function Cache_GetRows($Table) {
			$R = self::$Cache[$Table]["Rows"];
			if (count($R) > 0)
				return $R;
			return false;
		}
		private static function Cache_GetRow($Table, $ID) {
			$Rows = self::Cache_GetRows($Table);
			if ($Rows && $ID) {
				if (array_key_exists($ID, $Rows))
					return $Rows[$ID];
				return false;
			}
			return false;
		}
		private static function Cache_SetRow($Table, $ID, $Row) {
			self::$Cache[$Table]["Rows"][$ID] = $Row;
		}
		private static function Cache_InvalidateRow($Table, $ID) {
			unset(self::$Cache[$Table]["Rows"][$ID]);
		}
	}
	class BaseTempClass extends Base {
		public static $Table = "";
		public function __construct($Table = false, $ID = false, $Row = false) {
			parent::__construct($ID, $this, $Row, $Table);
		}					
	}
?>