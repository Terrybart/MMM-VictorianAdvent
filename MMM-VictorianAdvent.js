Module.register("MMM-VictorianAdvent", {

    elfHidingSpots: [
        ["31%", "36%"], ["5%", "50%"], ["95%", "77%"], ["33%", "12%"], ["57%", "92%"],
        ["94%", "12%"], ["4%", "82%"], ["35%", "89%"], ["62%", "90%"], ["94%", "34%"],
        ["4%", "25%"], ["33%", "50%"], ["52%", "8%"], ["26%", "91%"], ["87%", "89%"],
        ["3%", "57%"], ["95%", "90%"], ["31%", "21%"], ["38%", "66%"], ["94%", "55%"],
        ["6%", "9%"], ["61%", "93%"], ["18%", "47%"], ["35%", "3%"], ["92%", "95%"]
    ],

    start: function () {
        this.doorOpen = false;
        this.calendarTimer = null;

        if ((this.config || {}).testMode) {
            this.testOpenDay = 0;
            this.updateCalendar();

            const configuredInterval = Number(this.config.testIntervalSeconds);
            const intervalSeconds = Number.isFinite(configuredInterval) &&
                configuredInterval >= 1 && configuredInterval <= 3600
                ? configuredInterval : 10;

            this.calendarTimer = setInterval(() => {
                if (this.testOpenDay >= 25) {
                    clearInterval(this.calendarTimer);
                    return;
                }

                this.testOpenDay += 1;
                this.updateCalendar();

                if (this.testOpenDay >= 25) {
                    clearInterval(this.calendarTimer);
                }
            }, intervalSeconds * 1000);

            return;
        }

        this.updateCalendar();
        this.scheduleNextCalendarUpdate();
    },

    getCalendarOpenDay: function (now) {
        const config = this.config || {};
        if (config.testMode) {
            return this.testOpenDay || 0;
        }
        const month = Number(config.calendarMonth) === 11 ? 11 : 12;
        const configuredHour = Number(config.openHour);
        const configuredMinute = Number(config.openMinute);
        const hour = Number.isInteger(configuredHour) && configuredHour >= 0 && configuredHour <= 23
            ? configuredHour : 8;
        const minute = Number.isInteger(configuredMinute) && configuredMinute >= 0 && configuredMinute <= 59
            ? configuredMinute : 0;

        if (month === 12 && now.getMonth() === 0 && now.getDate() <= 6) {
            return 25;
        }

        if (now.getMonth() + 1 !== month) {
            return 0;
        }

        if (now.getDate() > 25) {
            return 25;
        }

        const timeReached = now.getHours() > hour ||
            (now.getHours() === hour && now.getMinutes() >= minute);

        return Math.max(0, Math.min(25, now.getDate() - (timeReached ? 0 : 1)));
    },

    applyCalendarState: function (root, now) {
        const config = this.config || {};
        const month = Number(config.calendarMonth) === 11 ? 11 : 12;
        const configuredHour = Number(config.openHour);
        const configuredMinute = Number(config.openMinute);
        const hour = Number.isInteger(configuredHour) && configuredHour >= 0 && configuredHour <= 23
            ? configuredHour : 8;
        const minute = Number.isInteger(configuredMinute) && configuredMinute >= 0 && configuredMinute <= 59
            ? configuredMinute : 0;
        const openDay = this.getCalendarOpenDay(now);
        const elf = root.querySelector(".advent-elf");
        const elfDay = Math.max(0, Math.min(25, openDay));
        if (elf && elfDay > 0) {
            const hidingSpot = this.elfHidingSpots[elfDay - 1];
            elf.style.left = hidingSpot[0];
            elf.style.top = hidingSpot[1];
            elf.classList.add("visible");
        } else if (elf) {
            elf.classList.remove("visible");
        }

        const finaleOpeningNow = config.testMode || (
            now.getMonth() + 1 === month &&
            now.getDate() === 25 &&
            (now.getHours() > hour || (now.getHours() === hour && now.getMinutes() >= minute))
        );
        let newlyOpenedFinale = false;

        root.querySelectorAll(".door-panel").forEach(panel => {
            const doorNumber = Number(panel.getAttribute("data-door"));
            const isOpen = panel.classList.contains("opening-door");

            if (doorNumber <= openDay) {
                if (!isOpen) {
                    panel.classList.add("opening-door");
                    if (doorNumber === 25) {
                        newlyOpenedFinale = true;
                    }
                }
            } else {
                panel.classList.remove("opening-door");
            }
        });

        const star = root.querySelector(".nativity-star");
        if (star) {
            if (openDay >= 25) {
                if (newlyOpenedFinale && finaleOpeningNow) {
                    setTimeout(() => star.classList.add("descending"), 4200);
                } else {
                    star.classList.add("descending");
                }
            } else {
                star.classList.remove("descending");
            }
        }

        this.doorOpen = openDay >= 25;
    },

    updateCalendar: function () {
        const root = document.querySelector(".victorian-advent");
        if (root) {
            this.applyCalendarState(root, new Date());
        }
    },

    scheduleNextCalendarUpdate: function () {
        const config = this.config || {};
        const configuredHour = Number(config.openHour);
        const configuredMinute = Number(config.openMinute);
        const hour = Number.isInteger(configuredHour) && configuredHour >= 0 && configuredHour <= 23
            ? configuredHour : 8;
        const minute = Number.isInteger(configuredMinute) && configuredMinute >= 0 && configuredMinute <= 59
            ? configuredMinute : 0;
        const now = new Date();
        const nextOpening = new Date(
            now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0
        );

        if (nextOpening.getTime() <= now.getTime()) {
            nextOpening.setDate(nextOpening.getDate() + 1);
        }

        this.calendarTimer = setTimeout(() => {
            this.updateCalendar();
            this.scheduleNextCalendarUpdate();
        }, nextOpening.getTime() - now.getTime());
    },

    getStyles: function () {
        return ["MMM-VictorianAdvent.css"];
    },

    getDom: function () {

        const wrapper = document.createElement("div");
        wrapper.className = "victorian-advent";

        const image = document.createElement("img");
        image.src = this.file("images/victorian-village.png");
        image.className = "village-image";

        wrapper.appendChild(image);

        const effects = document.createElement("div");
        effects.className = "village-effects";

        [
            { left: "2%", top: "5%" },
            { left: "calc(37% + 9px)", top: "calc(36% + 35px)" },
            { left: "93%", top: "24%" }
        ].forEach((position, index) => {
            const glow = document.createElement("span");
            glow.className = "streetlamp-glow";
            glow.style.left = position.left;
            glow.style.top = position.top;
            glow.style.animationDelay = `${index * 0.7}s`;
            effects.appendChild(glow);
        });

        [
            ["50%", "16%"], ["54%", "21%"], ["58%", "27%"],
            ["49%", "31%"], ["55%", "36%"], ["60%", "42%"],
            ["51%", "46%"], ["56%", "52%"], ["49%", "57%"],
            ["58%", "63%"], ["52%", "68%"], ["56%", "74%"]
        ].forEach((position, index) => {
            const light = document.createElement("span");
            light.className = "tree-light-twinkle";
            light.style.left = position[0];
            light.style.top = position[1];
            light.style.animationDelay = `${index * 0.23}s`;
            effects.appendChild(light);
        });

        const smoke = document.createElement("div");
        smoke.className = "chimney-smoke";
        for (let index = 0; index < 3; index += 1) {
            const puff = document.createElement("span");
            puff.className = `smoke-puff smoke-puff-${index + 1}`;
            smoke.appendChild(puff);
        }
        effects.appendChild(smoke);

        const elf = document.createElement("img");
        elf.className = "advent-elf";
        elf.src = this.file("images/elf-custom.png");
        elf.alt = "Hidden Christmas elf";
        effects.appendChild(elf);

        wrapper.appendChild(effects);

        const finaleStar = document.createElement("div");
        finaleStar.className = "nativity-star";
        finaleStar.textContent = "\u2605";
        wrapper.appendChild(finaleStar);

        const treasures = [

            { id: 1,  x: "7%",  y: "38%", icon: "🧸", numeral: "I" },
            { id: 2,  x: "73%", y: "53%", icon: "🎖️", numeral: "II" },
            { id: 3,  x: "28%", y: "58%", icon: "🕯️", numeral: "3" },
            { id: 4,  x: "61%", y: "33%", icon: "⏰", numeral: "IV" },
            { id: 5,  x: "78%", y: "48%", icon: "🗝️", numeral: "V" },
            { id: 6,  x: "86%", y: "41%", icon: "⚒️", numeral: "VI" },
            { id: 7,  x: "18%", y: "62%", icon: "📖", numeral: "7" },
            { id: 8,  x: "42%", y: "28%", icon: "🎁", numeral: "VIII" },
            { id: 9,  x: "54%", y: "69%", icon: "🔔", numeral: "IX" },
            { id: 10, x: "66%", y: "22%", icon: "✉️", numeral: "X" },
            { id: 11, x: "24%", y: "24%", icon: "🪙", numeral: "XI" },
            { id: 12, x: "82%", y: "18%", icon: "🎺", numeral: "12" },
            { id: 13, x: "10%", y: "18%", icon: "🦌", numeral: "XIII" },
            { id: 14, x: "91%", y: "62%", icon: "🏮", numeral: "XIV" },
            { id: 15, x: "70%", y: "76%", icon: "🚂", numeral: "XV" },
            { id: 16, x: "79%", y: "76%", icon: "🕊️", numeral: "XVI" },
            { id: 17, x: "22%", y: "79%", icon: "🎄", numeral: "XVII" },
            { id: 18, x: "43%", y: "82%", icon: "🎅", numeral: "XVIII" },
            { id: 19, x: "14%", y: "87%", icon: "🛷", numeral: "XIX" },
            { id: 20, x: "46%", y: "14%", icon: "🧦", numeral: "XX" },
            { id: 21, x: "58%", y: "56%", icon: "🍪", numeral: "XXI" },
            { id: 22, x: "71%", y: "63%", icon: "☕", numeral: "22" },
            { id: 23, x: "41%", y: "56%", icon: "🐑", numeral: "23" },
            { id: 24, x: "48%", y: "34%", icon: "🌟", numeral: "24" },
            { id: 25, x: "70%", y: "39%", icon: "⭐👼👶🐑👑", numeral: "XXV" }      ];
                     treasures.forEach(item => {

            const door = document.createElement("div");

            door.className = "treasure-door";

            door.style.left = item.x;
            door.style.top = item.y;

            const frame = document.createElement("div");


             if (item.id === 2) {
                frame.className = "door-frame door2-frame";
            } else if (item.id === 3) {
                frame.className = "door-frame door3-frame";
            } else if (item.id === 4) {
                frame.className = "door-frame door4-frame";
            } else if (item.id === 5) {
                frame.className = "door-frame door5-frame";
            } else if (item.id === 6) {
                frame.className = "door-frame door6-frame";
            } else if (item.id === 7) {
                frame.className = "door-frame door7-frame";
            } else if (item.id === 8) {
                frame.className = "door-frame door8-frame";
            } else if (item.id === 9) {
                frame.className = "door-frame door9-frame";
            } else if (item.id === 10) {
                frame.className = "door-frame door10-frame";
            } else if (item.id === 11) {
                frame.className = "door-frame door11-frame";
            } else if (item.id === 12) {
                frame.className = "door-frame door12-frame";
            } else if (item.id === 13) {
                frame.className = "door-frame door13-frame";
            } else if (item.id === 14) {
                frame.className = "door-frame door14-frame";
            } else if (item.id === 15) {
                frame.className = "door-frame door15-frame";
            } else if (item.id === 16) {
                frame.className = "door-frame door16-frame";
            } else if (item.id === 17) {
                frame.className = "door-frame door17-frame";
            } else if (item.id === 18) {
                frame.className = "door-frame door18-frame";
            } else if (item.id === 19) {
               frame.className = "door-frame door19-frame";
            } else if (item.id === 20) {
               frame.className = "door-frame door20-frame";
            } else if (item.id === 21) {
               frame.className = "door-frame door21-frame";
             } else if (item.id === 22) {
               frame.className = "door-frame door22-frame";
           } else if (item.id === 23) {
               frame.className = "door-frame door23-frame";
            } else if (item.id === 24) {
               frame.className = "door-frame door24-frame";
            } else if (item.id === 25) {
               frame.className = "door-frame door25-frame";


                              } else {
                frame.className = "door-frame";
            }

            const reveal = document.createElement("div");

            if (item.id === 2) {
                reveal.className = "door-reveal door2-reveal";
            } else if (item.id === 3) {
                reveal.className = "door-reveal door3-reveal";
            } else if (item.id === 4) {
                reveal.className = "door-reveal door4-reveal";
            } else if (item.id === 5) {
                reveal.className = "door-reveal door5-reveal";
            } else if (item.id === 6) {
                reveal.className = "door-reveal door6-reveal";
            } else if (item.id === 7) {
                reveal.className = "door-reveal door7-reveal";
            } else if (item.id === 8) {
                reveal.className = "door-reveal door8-reveal";
            } else if (item.id === 9) {
                reveal.className = "door-reveal door9-reveal";
            } else if (item.id === 10) {
                reveal.className = "door-reveal door10-reveal";
            } else if (item.id === 11) {
                reveal.className = "door-reveal door11-reveal";
            } else if (item.id === 12) {
                reveal.className = "door-reveal door12-reveal";
            } else if (item.id === 13) {
                reveal.className = "door-reveal door13-reveal";
            } else if (item.id === 14) {
                reveal.className = "door-reveal door14-reveal";
            } else if (item.id === 15) {
                reveal.className = "door-reveal door15-reveal";
            } else if (item.id === 16) {
                reveal.className = "door-reveal door16-reveal";
            } else if (item.id === 17) {
                reveal.className = "door-reveal door17-reveal";
            } else if (item.id === 18) {
                reveal.className = "door-reveal door18-reveal";
            } else if (item.id === 19) {
               reveal.className = "door-reveal door19-reveal";
            } else if (item.id === 20) {
               reveal.className = "door-reveal door20-reveal";
           } else if (item.id === 21) {
               reveal.className = "door-reveal door21-reveal";
           } else if (item.id === 22) {
               reveal.className = "door-reveal door22-reveal";
            } else if (item.id === 23) {
               reveal.className = "door-reveal door23-reveal";
             } else if (item.id === 24) {
               reveal.className = "door-reveal door24-reveal";
            } else if (item.id === 25) {
               reveal.className = "door-reveal door25-reveal";

                                 } else {
                reveal.className = "door-reveal";
            }

            const treasure = document.createElement("div");

                 if (item.id === 2) {
                treasure.className = "door-medal rock";
            } else  if (item.id === 3) {
                treasure.className = "door-candle flicker";
            } else if (item.id === 4) {
                treasure.className = "door-clock bob";
            } else if (item.id === 5) {
                treasure.className = "door-key rock";
            } else if (item.id === 6) {
                treasure.className = "door-forge bob";
            } else if (item.id === 7) {
                treasure.className = "door-book rock";
            } else if (item.id === 8) {
                treasure.className = "door-gift rock";
            } else if (item.id === 9) {
                treasure.className = "door-bell bob";
            } else if (item.id === 10) {
                treasure.className = "door-letter rock";
            } else if (item.id === 11) {
                treasure.className = "door-coin rock";
            } else if (item.id === 12) {
                treasure.className = "door-trumpet bob";
            } else if (item.id === 13) {
                treasure.className = "door-reindeer bob";
            } else if (item.id === 14) {
                treasure.className = "door-lantern bob";
            } else if (item.id === 15) {
                treasure.className = "door-snowflake bob";
            } else if (item.id === 16) {
                treasure.className = "door-dove bob";
            } else if (item.id === 17) {
                treasure.className = "door-tree bob";
            } else if (item.id === 18) {
                treasure.className = "door-santa bob";
            } else if (item.id === 19) {
               treasure.className = "door-sleigh bob";
            } else if (item.id === 20) {
               treasure.className = "door-stocking bob";
            } else if (item.id === 21) {
               treasure.className = "door-cookie bob";
             } else if (item.id === 22) {
               treasure.className = "door-cup bob";
            } else if (item.id === 23) {
               treasure.className = "door-sheep bob";
            } else if (item.id === 24) {
               treasure.className = "door-star bob";
            } else if (item.id === 25) {
               treasure.className = "door-baby bob";

                             } else {
                treasure.className = "door-teddy rock";
            }

            treasure.innerHTML = item.icon;

            reveal.appendChild(treasure);

            const panel = document.createElement("div");

            if (item.id === 2) {
                panel.className = "door-panel door2-panel";
            } else if (item.id === 3) {
                panel.className = "door-panel door3-panel";
            } else if (item.id === 4) {
                panel.className = "door-panel door4-panel";
            } else if (item.id === 5) {
                panel.className = "door-panel door5-panel";
            } else if (item.id === 6) {
                panel.className = "door-panel door6-panel";
            } else if (item.id === 7) {
                panel.className = "door-panel door7-panel";
            } else if (item.id === 8) {
                panel.className = "door-panel door8-panel";
            } else if (item.id === 9) {
                panel.className = "door-panel door9-panel";
            } else if (item.id === 10) {
                panel.className = "door-panel door10-panel";
            } else if (item.id === 11) {
                panel.className = "door-panel door11-panel";
            } else if (item.id === 12) {
                panel.className = "door-panel door12-panel";
            } else if (item.id === 13) {
                panel.className = "door-panel door13-panel";
            } else if (item.id === 14) {
                panel.className = "door-panel door14-panel";
            } else if (item.id === 15) {
                panel.className = "door-panel door15-panel";
            } else if (item.id === 16) {
                panel.className = "door-panel door16-panel";
            } else if (item.id === 17) {
                panel.className = "door-panel door17-panel";
            } else if (item.id === 18) {
                panel.className = "door-panel door18-panel";
           } else if (item.id === 19) {
                panel.className = "door-panel door19-panel";
            } else if (item.id === 20) {
                 panel.className = "door-panel door20-panel";
            } else if (item.id === 21) {
                 panel.className = "door-panel door21-panel";
            } else if (item.id === 22) {
                 panel.className = "door-panel door22-panel";
            } else if (item.id === 23) {
                 panel.className = "door-panel door23-panel";
            } else if (item.id === 24) {
                 panel.className = "door-panel door24-panel";
            } else if (item.id === 25) {
                 panel.className = "door-panel door25-panel";
                               } else {
                panel.className = "door-panel";
            }

            panel.setAttribute("data-door", item.id);

            const plaque = document.createElement("div");

            plaque.className = "door-number";
            plaque.innerHTML = item.numeral;

            panel.appendChild(plaque);

            frame.appendChild(reveal);
            frame.appendChild(panel);

            door.appendChild(frame);

            wrapper.appendChild(door);

        });

        this.applyCalendarState(wrapper, new Date());

        return wrapper;
    }

});
