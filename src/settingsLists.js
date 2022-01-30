export default {
    SETTINGS: [
        {
            key: "conversionMultipliers",
            data: {
                type: String,
                default: "{\"inch\": 2.5, \"feet\": 0.3, \"mile\": 1.6, \"pound\": 0.5, \"gallon\": 3.5}",
                scope: "world",
                config: false,
                restricted: true,
            },
        },
        {
            key: "inchConversionMultiplier",
            data: {
                name: "Inch Conversion Multiplier: ",
                hint: "1 inch = this many centimeters",
                type: Number,
                default: 2.5,
                scope: "world",
                config: true,
                restricted: true,
            },
        },
        {
            key: "feetConversionMultiplier",
            data: {
                name: "Feet Conversion Multiplier: ",
                hint: "1 feet = this many meters",
                type: Number,
                default: 0.3,
                scope: "world",
                config: true,
                restricted: true,
            },
        },
        {
            key: "mileConversionMultiplier",
            data: {
                name: "Mile Conversion Multiplier: ",
                hint: "1 mile = this many kilometers",
                type: Number,
                default: 1.6,
                scope: "world",
                config: true,
                restricted: true,
            },
        },
        {
            key: "poundConversionMultiplier",
            data: {
                name: "Pound Conversion Multiplier: ",
                hint: "1 pound = this many kilograms",
                type: Number,
                default: 0.5,
                scope: "world",
                config: true,
                restricted: true,
            },
        },
        {
            key: "gallonConversionMultiplier",
            data: {
                name: "Gallon Conversion Multiplier: ",
                hint: "1 gallon = this many liters",
                type: Number,
                default: 3.5,
                scope: "world",
                config: true,
                restricted: true,
            },
        },
        {
            key: "sceneConversion",
            data: {
                name: "Enable scene conversion: ",
                hint: "This setting allows automatic conversion of scene settings.",
                type: Boolean,
                default: true,
                scope: "world",
                config: true,
                restricted: true,
            }
        },
        {
            key: "sceneGridDistance",
            data: {
                name: "Scene grid distance: ",
                hint: "Converted size for a single square. Warning: This does not affect conversion on the sheet",
                type: Number,
                default: 1.5,
                scope: "world",
                config: true,
                restricted: true,
            }

        },
        {
            key: "sceneGridUnits",
            data: {
                name: "Scene grid units: ",
                hint: "Warning: This does not affect conversion on the sheet",
                type: String,
                default: "m",
                scope: "world",
                config: true,
                restricted: true,
            }

        },
        {
            key: "forceShortening",
            data: {
                name: "Force unit shortening?",
                hint: "Force units to be abbreviated (pound -> kg)",
                type: Boolean,
                default: false,
                scope: "world",
                config: true,
                restricted: true,
            }

        },
        {
            key: 'buttonHidden',
            data: {
                name: 'Hide metrify button',
                hint: 'Check this box if you want the metrify button to be hidden',
                type: Boolean,
                default: false,
                scope: 'client',
                config: true
            }
        }
    ]
}
