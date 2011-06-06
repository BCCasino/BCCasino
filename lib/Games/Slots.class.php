<?

class SlotMachine
{
	/*
	TODO: Load settings from file so probabilites can be customized by site operator
	*/
	private $name ="µBTC Slot";
	
	private $symbols = array("TripleBar" => 
						array ("img" => "img/slots/tbar.png",
							   "probability" => 0.01),
					 "DoubleBar" => 
						array ("img" => "img/slots/dbar.png",
							   "probability" => 0.02),
					 "Bar" 		 => 
						array ("img" => "img/slots/bar.png",
							   "probability" => 0.05),
					 "Cherry"	 => 
						array ("img" => "img/slots/cherry.png",
							   "probability" => 0.1),
					 "Blank" 	 =>
						array ("img" => "img/slots/blank.png",
							   "probability" => 0.83));
	
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