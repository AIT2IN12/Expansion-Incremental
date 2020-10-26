function toPlaces(x, precision, maxAccepted) {
	x = new Decimal(x)
	let result = x.toStringWithDecimalPlaces(precision)
	if (new Decimal(result).gte(maxAccepted)) {
		result = new Decimal(maxAccepted-Math.pow(0.1, precision)).toStringWithDecimalPlaces(precision)
	}
	return result
}
function exponentialFormat(num, precision) {
	let e = num.log10().floor()
	let m = num.div(Decimal.pow(10, e))
	return toPlaces(m, precision, 10)+"e"+formatWhole(e)
}
function commaFormat(num, precision) {
	if (num === null || num === undefined) return "NaN"
	if (num.mag < 0.001) return (0).toFixed(precision)
	return toPlaces(num, precision, 1e9).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
function fixValue(x, y = 0) {
	return x || new Decimal(y)
}
function sumValues(x) {
	x = Object.values(x)
	if (!x[0]) return new Decimal(0)
	return x.reduce((a, b) => Decimal.add(a, b))
}
function format(decimal, precision=2) {
	if (decimal=="X") return "X"
	decimal = new Decimal(decimal)
	if (isNaN(decimal.sign)||isNaN(decimal.layer)||isNaN(decimal.mag)) {
		player.hasNaN = true;
		return "NaN"
	}
	if (decimal.sign<0) return "-"+format(decimal.neg(), precision)
	if (decimal.mag == Number.POSITIVE_INFINITY) return "Infinity"
	if (decimal.gte("eeee10")) {
		var slog = decimal.slog()
		if (slog.gte(1e9)) return "10^^" + format(slog.floor())
		else if (slog.gte(1000)) return "10^^"+commaFormat(slog, 0)
		else return "10^^" + commaFormat(slog, 2)
	} else if (decimal.gte("e1e6")) return "e"+formatWhole(decimal.log10(), 2)
	else if (decimal.gte("1e1000")) return exponentialFormat(decimal, Math.max(3-(decimal.log10().log10().toNumber()-3), 0))
	else if (decimal.gte(1e9)) return exponentialFormat(decimal, 3)
	else if (decimal.gte(1e3)) return commaFormat(decimal, 0)
	else return commaFormat(decimal, precision)
}
function formatWhole(decimal) {
	return format(decimal, 0)
}
//END OF NUMBER FORMAT FUNCTION GROUP//

//START OF GAME SCRIPT//

var player = {
	//PRODUCTION//
	autocreditCost: new Decimal(1.00),
	autocredit: "",
	credits: new Decimal(1.00),
	creditpertick: new Decimal(0.1),
	leftoverCreditPerTick: new Decimal(1),
	autoamount: new Decimal(1),
	autoInterval: new Decimal(500),
	basicupg1cost: 10,
	basicupg1mult: 1,
	basicupg2cost: new Decimal(50),
	basicupg2spdmult: new Decimal(1.0),
	//EXPANSION//
	ticketCost: 15,
	ticketAmnt: 0,
	BasicUpgUnlock: false
}

setInterval(update, 1)
function update() {
	player.autoInterval = new Decimal(500)
	player.autoInterval = player.autoInterval.div(player.autoamount).div(player.basicupg2spdmult)
	if (player.autoInterval.lte(3.3)) {
		player.leftoverCreditPerTick = 3.3/player.autoInterval
	}
    document.getElementById("credits").innerHTML = "You have "+format(player.credits, precision=2)+" ₡"
    document.getElementById("buyGen").innerHTML = "Buy ₡ generator <br>"+"Cost: "+format(player.autocreditCost, precision=2)+" ₡"
    document.getElementById("buyTicket").innerHTML = "Exchange ₡ for an Ex-tickets<br>"+"Cost: "+format(player.ticketCost, precision=2)+" ₡"
	document.getElementById("ticketindicator").innerHTML = format(player.ticketAmnt, precision=0)
	document.getElementById("basicUpg1").innerHTML = "Increase ₡ gain by x1.1 <br>Currently: x"+format(player.basicupg1mult, precision=2)+"<br>Cost: "+format(player.basicupg1cost, precision=2)+" ₡"
	document.getElementById("basicUpg2").innerHTML = "₡ gain tickspeed is faster<br>Currently: "+format(player.basicupg2spdmult, precision=2)+"<br>Cost: "+format(player.basicupg2cost, precision=2)+" ₡"
	if (player.BasicUpgUnlock==true) {
		document.getElementById("BasicUpgs").style.display = "block"
	}
}
function autoCredit() {
	player.autoInterval = new Decimal(500)
	player.autoInterval = player.autoInterval.div(player.autoamount).div(player.basicupg2spdmult)
	clearInterval(player.autocredit)
	player.autocredit = setInterval(increaseCredit, player.autoInterval)
}
function increaseCredit() {
    player.credits = player.credits.add(player.creditpertick.mul(player.leftoverCreditPerTick).mul(player.basicupg1mult));
}
function buygen() {
    if (player.credits>=player.autocreditCost) {
        player.credits = player.credits.sub(player.autocreditCost)
        player.autocreditCost *= 1.4 
        clearInterval(player.autocredit)
		player.autoamount = player.autoamount.add(1)
		autoCredit()
    }
}
function buyticket() {
    if (player.credits>=player.ticketCost) {
        player.credits = player.credits.sub(player.ticketCost)
        player.ticketAmnt += 1
        player.ticketCost += 1+(player.ticketAmnt**1.4)
    }
}
function unlockBasicUpg() {
	if (player.ticketAmnt>=3 & player.BasicUpgUnlock==false) {
		player.ticketAmnt -= 3
		player.BasicUpgUnlock = true
	}
}

//Basic credit upgrades I//
function buyBasicUpg1() {
	if (player.credits.gte(player.basicupg1cost)) {
		player.credits = player.credits.sub(player.basicupg1cost)
		player.basicupg1cost *= 1.2
		player.basicupg1mult *= 1.1
	}
}
function buyBasicUpg2() {
	if (player.credits.gte(player.basicupg2cost)) {
		player.credits = player.credits.sub(player.basicupg2cost)
		player.basicupg2spdmult = player.basicupg2spdmult.mul(2.25)
		player.basicupg2cost = player.basicupg2cost.mul(player.basicupg2spdmult.mul(player.basicupg2cost).log10().add(1).mul(2.1))
		autoCredit()
	}
}


function save() {
	localStorage.setItem("expansion-incremental", JSON.stringify(player))
}