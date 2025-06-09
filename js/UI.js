class UI {

	#steps = [];
	#textContent;
	#selectCallback;

	// If changing this, css must also be changed to reflect transition speed;
	#TRANSITION_SPEED = 1000;
	#TEXT_TOP_PERCENT = 85;

	constructor(stepCount, initialText, selectCallback, texts) {
		this.#initSlider(stepCount, texts);
		this.#initText(initialText);
		this.#selectCallback = selectCallback;
	}

	#initSlider(stepCount, texts) {
		let stepsContainer = document.getElementById("slider-steps-container");
		for (var i = 0; i < stepCount; i++) {
			let step = document.createElement("div");
			step.classList.add('slider-step-style');
			step.style.top = (i * 100 / (stepCount - 1)) + "%";
			step.style.transform = "scale(0.5)";
			step.id = i;
			stepsContainer.appendChild(step);

			let helper = document.createElement("div");
			helper.innerHTML = texts[i];
			helper.classList.add('slider-step-helper-style');
			helper.style.top = (i * 100 / (stepCount - 1)) + "%";
			stepsContainer.appendChild(helper);

			let selectZone = document.createElement("div");
			selectZone.classList.add('slider-step-selector-style');
			selectZone.style.top = (i * 100 / (stepCount - 1)) + "%";

			selectZone.addEventListener("click", () => {
				this.#selectCallback(parseInt(step.id), false);
			});
			selectZone.addEventListener("mouseover", (event) => {
				helper.style.opacity = 1;
			});
			selectZone.addEventListener("mouseout", (event) => {
				helper.style.opacity = 0;
			});
			stepsContainer.appendChild(selectZone);

			this.#steps.push(step);
		}
		this.selectSliderStep(0);
	}

	selectSliderStep(step) {
		for (let i = 0; i < this.#steps.length; i++) {
			if (i == step) {
				this.#steps[i].style.transform = "translateY(-50%) scale(1)"
			} else {
				this.#steps[i].style.transform = "translateY(-50%) scale(0.5)"
			}
		}
	}

	deselectSliderStep() {
		for (let i = 0; i < this.#steps.length; i++) {
			this.#steps[i].style.transform = "translateY(-50%) scale(0.5)"
		}

	}

	#initText(initialText) {
		this.#textContent = document.getElementById("text-content");
		this.#textContent.innerHTML = initialText;
		this.#textContent.style.opacity = 1;
	}

	displayText(text, fromBottom) {
		this.textDisappear(fromBottom);
		setTimeout(() => {
			this.#textContent.innerHTML = text;
			this.textAppear(fromBottom);
		}, this.#TRANSITION_SPEED);
	}

	hideText() {
		this.textDisappear(false);
	}

	textAppear(fromBottom) {
		this.#textContent.style.transition = "none";
		this.#textContent.style.top = fromBottom ? this.#TEXT_TOP_PERCENT + 15 + "%" : this.#TEXT_TOP_PERCENT - 15 + "%";
		this.#textContent.offsetHeight;
		this.#textContent.style.transition = "";

		this.#textContent.style.opacity = 1;
		this.#textContent.style.top = this.#TEXT_TOP_PERCENT + "%";
	}

	textDisappear(fromBottom) {
		this.#textContent.style.top = fromBottom ? this.#TEXT_TOP_PERCENT - 15 + "%" : this.#TEXT_TOP_PERCENT + 15 + "%";
		this.#textContent.style.opacity = 0;
	}
}

export {UI};