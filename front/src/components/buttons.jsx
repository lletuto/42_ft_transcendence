"use client";

// same colors for all buttons
const BUTTON_BORDER_CLASS = "border-[#f0563a] hover:border-[#fa3960] shadow-[0_0_20px_rgba(190,24,93,0.3)]";

const BUTTONS = {
  rock: {
    label: "Rock",
    imageSrc: "/choices/pierre.png",
  },
  paper: {
    label: "Paper",
    imageSrc: "/choices/feuille.png",
  },
  scissors: {
    label: "Scissors",
    imageSrc: "/choices/ciseaux.png",
  },
  well: {
    label: "Well",
    imageSrc: "/choices/puit.png",
  },
};

function ChoiceButton({ onClick, label, imageSrc, className = "" }) {
  return (
	<button  
	onClick={onClick}
	type="button"
	/* Clamp(mini, fluent, maxi) :
		- minimal size sur tout petit écran : 60px
		- fluent size : 8% de la largeur de l'écran (8vw)
		- maxi size sur écran géant : 100px
	*/
	className={`group relative flex h-[clamp(30px,8vw,100px)] w-[clamp(30px,8vw,100px)] items-center justify-center overflow-hidden rounded-full border-4 bg-[#ff9db1] transition-all duration-200 hover:scale-105 active:scale-95 ${BUTTON_BORDER_CLASS}`}
	>
	<img
		src={imageSrc}
		alt={label}
		className="h-full w-full object-cover object-right scale-130 transition-transform duration-300 group-hover:scale-120"
	/>

	<div className="absolute inset-0 bg-[#fa3960]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

	<div className="absolute bottom-0 inset-x-0 h-3/4 bg-gradient-to-t from-[#fa3960]/50 to-transparent pointer-events-none" />

	{/* INCURVED TEXT */}
	<div className="absolute bottom-0 w-full h-[clamp(26px,3.5vw,44px)] pointer-events-none">
		<svg viewBox="0 0 100 40" className="h-full w-full">
		<defs>
			<path id={`curve-${label}`} d="M 12,12 Q 50,38 88,12" fill="none" />
		</defs>
		{/* dynamic police size
			- Mini : 8px
			- fluent : 1% de la largeur de l'écran (1vw)
			- Maxi : 14px
		*/}
		<text className="fill-white font-black uppercase text-[clamp(8px,1vw,14px)] tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
			<textPath href={`#curve-${label}`} startOffset="50%" textAnchor="middle">
			{label}
			</textPath>
		</text>
		</svg>
	</div>
	</button>
  );
}


export function RockButton(props) {
  return <ChoiceButton {...BUTTONS.rock} {...props}  />;
}

export function PaperButton(props) {
  return <ChoiceButton {...BUTTONS.paper} {...props} />;
}

export function ScissorsButton(props) {
  return <ChoiceButton {...BUTTONS.scissors} {...props} />;
}

export function WellButton(props) {
  return <ChoiceButton {...BUTTONS.well} {...props} />;
}

export default ChoiceButton;