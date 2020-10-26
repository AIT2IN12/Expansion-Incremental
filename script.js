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
//PRODUCTION//
var autocreditCost = new Decimal(1.00);
var autocredit;
var credits = new Decimal(1.00);
var creditpertick = new Decimal(0.1);
var leftoverCreditPerTick = new Decimal(1);
var autoamount = new Decimal(1);
var autoInterval = new Decimal(500);
var basicupg1cost = 10;
var basicupg1mult = 1;
var basicupg2cost = new Decimal(50);
var basicupg2spdmult = new Decimal(1.0);
//EXPANSION//
var ticketCost = 15
var ticketAmnt = 0
var BasicUpgUnlock = false
setInterval(update, 1)
function update() {
	autoInterval = new Decimal(500)
	autoInterval = autoInterval.div(autoamount).div(basicupg2spdmult)
	if (autoInterval.lte(3.3)) {
		leftoverCreditPerTick = 3.3/autoInterval
	}
    document.getElementById("credits").innerHTML = "You have "+format(credits, precision=2)+" ₡"
    document.getElementById("buyGen").innerHTML = "Buy ₡ generator <br>"+"Cost: "+format(autocreditCost, precision=2)+" ₡"
    document.getElementById("buyTicket").innerHTML = "Exchange ₡ for an Ex-tickets<br>"+"Cost: "+format(ticketCost, precision=2)+" ₡"
	document.getElementById("ticketindicator").innerHTML = format(ticketAmnt, precision=0)
	document.getElementById("basicUpg1").innerHTML = "Increase ₡ gain by x1.1 <br>Currently: x"+format(basicupg1mult, precision=2)+"<br>Cost: "+format(basicupg1cost, precision=2)+" ₡"
	document.getElementById("basicUpg2").innerHTML = "₡ gain tickspeed is faster<br>Currently: "+format(basicupg2spdmult, precision=2)+"<br>Cost: "+format(basicupg2cost, precision=2)+" ₡"
	if (BasicUpgUnlock==true) {
		document.getElementById("BasicUpgs").style.display = "block"
	}
}
function autoCredit() {
	autoInterval = new Decimal(500)
	autoInterval = autoInterval.div(autoamount).div(basicupg2spdmult)
	clearInterval(autocredit)
	autocredit = setInterval(increaseCredit, autoInterval)
}
function increaseCredit() {
    credits = credits.add(creditpertick.mul(leftoverCreditPerTick).mul(basicupg1mult));
}
function buygen() {
    if (credits>=autocreditCost) {
        credits = credits.sub(autocreditCost)
        autocreditCost *= 1.4 
        clearInterval(autocredit)
		autoamount = autoamount.add(1)
		autoCredit()
    }
}
function buyticket() {
    if (credits>=ticketCost) {
        credits = credits.sub(ticketCost)
        ticketAmnt += 1
        ticketCost += 1+(ticketAmnt**1.4)
    }
}
function unlockBasicUpg() {
	if (ticketAmnt>=3 & BasicUpgUnlock==false) {
		ticketAmnt -= 3
		BasicUpgUnlock = true
	}
}

//Basic credit upgrades I//
function buyBasicUpg1() {
	if (credits.gte(basicupg1cost)) {
		credits = credits.sub(basicupg1cost)
		basicupg1cost *= 1.2
		basicupg1mult *= 1.1
	}
}
function buyBasicUpg2() {
	if (credits.gte(basicupg2cost)) {
		credits = credits.sub(basicupg2cost)
		basicupg2spdmult = basicupg2spdmult.mul(2.25)
		basicupg2cost = basicupg2cost.mul(basicupg2spdmult.mul(basicupg2cost).log10().add(1).mul(2.1))
		autoCredit()
	}
}