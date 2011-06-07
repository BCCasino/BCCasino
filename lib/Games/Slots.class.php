<?

class SlotMachine
{
	/*
	TODO: Load settings from file so probabilites can be customized by site operator
	*/
	private $name ="µBTC Slot";
	
	private $symbols = array("TripleBar" => 
						array ("img" => "img/slots/tbar.png",
							   "probability" => 0.01,
							   "class" => array("")),
					 "DoubleBar" => 
						array ("img" => "img/slots/dbar.png",
							   "probability" => 0.02,
							   "class" => array("")),
					 "Bar" 		 => 
						array ("img" => "img/slots/bar.png",
							   "probability" => 0.05,
							   "class" => array("")),
					 "Cherry"	 => 
						array ("img" => "img/slots/cherry.png",
							   "probability" => 0.1,
							   "class" => array("")),
					 "Blank" 	 =>
						array ("img" => "img/slots/blank.png",
							   "probability" => 0.83,
							   "class" => array("")));
	
	private $payTable = array(array ("percoin" => 1,"maxcoinbonus" => 0,"probability" = > 0.125, 
								"line" => array("blank","blank","blank")),
							  array ("percoin" => 2,"maxcoinbonus" => 0,"probability" = > 0.002884, 
								"line" => array("blue","blue","blue")),
							  array ("percoin" => 2,"maxcoinbonus" => 0,"probability" = > 0.003952, 
								"line" => array("white","white","white")),
							  array ("percoin" => 2,"maxcoinbonus" => 0,"probability" = > 0.001278, 
								"line" => array("red","red","red")),
							  array ("percoin" => 5,"maxcoinbonus" => 0,"probability" = > 0.030430, 
								"line" => array("bar","bar","bar")),
							  array ("percoin" => 10,"maxcoinbonus" => 0,"probability" = > 0.001648, 
								"line" => array("1bar","1bar","1bar")),
							  array ("percoin" => 20,"maxcoinbonus" => 0,"probability" = > 0.000431, 
								"line" => array("red","white","blue")),
							  array ("percoin" => 25,"maxcoinbonus" => 0,"probability" = > 0.001442, 
								"line" => array("2bar","2bar","2bar")),
							  array ("percoin" => 40,"maxcoinbonus" => 0,"probability" = > 0.000801, 
								"line" => array("3bar","3bar","3bar")),
							  array ("percoin" => 50,"maxcoinbonus" => 0,"probability" = > 0.000687, 
								"line" => array("1bar","2bar","3bar")),
							  array ("percoin" => 80,"maxcoinbonus" => 0,"probability" = > 0.004574, 
								"line" => array("seven","seven","seven")),
							  array ("percoin" => 150,"maxcoinbonus" => 0,"probability" = > 0.000160, 
								"line" => array("blue7","blue7","blue7")),
							  array ("percoin" => 200,"maxcoinbonus" => 0,"probability" = > 0.000160, 
								"line" => array("white7","white7","white7")),
							  array ("percoin" => 1200,"maxcoinbonus" => 200,"probability" = > 0.000011, 
								"line" => array("red7","red7","red7")),
							  array ("percoin" => 2400,"maxcoinbonus" => 400,"probability" = > 0.000004, 
								"line" => array("red7","white7","blue7")));
	
	private $reelLayout = array( array ("Blank",
								"Cherry",
								"Blank",
								"Bar",
								"Blank",
								"Blank",
								"DoubleBar",
								"Blank",
								"TripleBar"),
						array ("Blank",
								"Cherry",
								"Blank",
								"Bar",
								"Blank",
								"Blank",
								"DoubleBar",
								"Blank",
								"TripleBar"),
						array ("Blank",
								"Cherry",
								"Blank",
								"Bar",
								"Blank",
								"Blank",
								"DoubleBar",
								"Blank",
								"TripleBar"));
	public function SpinReels()
	{
	//foreach reel in our slot machine we make a random number between 0-1 (float)
	//we then loop through our possibile symbols and add their probability until we
	//get to the one that was randomly selected
	//Note: the probability factors are how you can adjust the long term payout of the machine
	//IE: if the odds of triplebar showing up is 0.01, then three triple bars = 0.01*0.01*0.01 or 
	//1 in 1 million
	//once this is done we add the reels spin to an output array and continue, once all reels are done
	//we return
	
	//Another function will determine a winner based on a pay table

		$Spin = array();
		for($x =0; $x<count($this->reelLayout);$x++)
		{
			$rnd = (mt_rand()/mt_getrandmax())*100.0;
			$rnd = round($rnd);
			$rnd /= 100.0;
			$val =0;
			foreach($this->symbols as $symbol)
			{
				if($rnd <= $symbol["probability"]+$val)
				{
					$Spin[$x] =array_search($symbol,$this->symbols);
					break;
				}
				$val+=$symbol["probability"];
			}		
		}		
		return $Spin;
	}
	
}

?>