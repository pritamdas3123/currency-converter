const PRIMARY_URL = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";
const FALLBACK_URL = "https://latest.currency-api.pages.dev/v1/currencies";

const dropdowns = document.querySelectorAll(".dropdown select");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const btn = document.querySelector("form button");
const msg = document.querySelector(".msg");
const swapBtn = document.querySelector(".dropdown i");

for(let select of dropdowns) {
    for(let currCode in countryList) {
        let newOption = document.createElement("option");
        newOption.innerText = currCode;
        newOption.value = currCode;
        if (select.name === "from" && currCode === "USD") {
            newOption.selected = "selected";
        } else if (select.name === "to" && currCode === "INR"){
            newOption.selected = "selected";
        }
        select.append(newOption);
    }
    select.addEventListener("change", (evt) => {
        updateFlag(evt.target);
    });
}

const updateFlag = (element) => {
    let currCode = element.value;
    let countryCode = countryList[currCode];
    let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
    let img = element.parentElement.querySelector("img");
    img.src = newSrc;
};

updateFlag(fromCurr);
updateFlag(toCurr);

const fetchRate = async (from, to) => {
    let data;
    try {
        const response = await fetch(`${PRIMARY_URL}/${from}.json`);
        if (!response.ok) throw new Error(`Primary API responded ${response.status}`);
        data = await response.json();
    } catch (primaryErr) {
        const response = await fetch(`${FALLBACK_URL}/${from}.json`);
        if (!response.ok) throw new Error(`Fallback API responded ${response.status}`);
        data = await response.json();
    }
    const rate = data[from]?.[to];
    if (rate === undefined) {
        throw new Error(`No rate found for ${from} → ${to}`);
    }
    return rate;
};

const updateExchangeRate = async () => {
    let amount = document.querySelector(".amount input");
    let amtVal = amount.value;
    if (amtVal === "" || amtVal <= 0) {
        amtVal = 1;
        amount.value = 1;
    }
    
    try {
        const rate = await fetchRate(fromCurr.value.toLowerCase(), toCurr.value.toLowerCase());
        let finalAmount = (amtVal * rate).toFixed(2);
        msg.classList.remove("error");
        msg.innerText = `${amtVal} ${fromCurr.value} = ${finalAmount} ${toCurr.value}`;
    } catch (err) {
        msg.classList.add("error");
        msg.innerText = "Unable to fetch exchange rate. Please try again.";
    }
};

swapBtn.addEventListener("click", () => {
    let temp = fromCurr.value;
    fromCurr.value = toCurr.value;
    toCurr.value = temp;

    updateFlag(fromCurr);
    updateFlag(toCurr);
    updateExchangeRate();
});

window.addEventListener("load", () => {
    updateExchangeRate();
});

btn.addEventListener("click", async(evt) => {
    evt.preventDefault();
    updateExchangeRate();
});