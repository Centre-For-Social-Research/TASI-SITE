const express = require('express')
const fs = require("fs")
const cors = require("cors")
const app = express()

const port = Number(process.env.PORT || 5001)
const apiKey = process.env.CHECKIN_API_KEY
const allowDataExport = process.env.ALLOW_DATA_EXPORT === "true"
const corsAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

app.disable("x-powered-by")
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true)
        }

        if (corsAllowedOrigins.length === 0 || corsAllowedOrigins.includes(origin)) {
            return callback(null, true)
        }

        return callback(new Error("Origin not allowed by CORS"))
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-API-Key"]
}))

app.use(express.json({ limit: "16kb" }))

let jsonDB

const requireApiKey = (req, res, next) => {
    if (!apiKey) {
        return res.status(500).json({ message: "Server misconfiguration: CHECKIN_API_KEY is missing" })
    }

    const provided = req.get("X-API-Key") || ""
    if (provided !== apiKey) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    next()
}

const isValidId = (id) => typeof id === "string" && id.length >= 8 && id.length <= 256

const csvEscape = (value) => {
    const normalized = String(value ?? "")
    if (/[,"\n\r]/.test(normalized)) {
        return `"${normalized.replace(/"/g, '""')}"`
    }
    return normalized
}

const serializeRowsToCsv = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) {
        return ""
    }

    const headers = Object.keys(rows[0])
    const headerRow = headers.join(",")
    const bodyRows = rows.map((row) => headers.map((key) => csvEscape(row[key])).join(","))
    return `${headerRow}\n${bodyRows.join("\n")}`
}

const parseCsvLine = (line) => {
    const values = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const next = line[i + 1]

        if (char === '"') {
            if (inQuotes && next === '"') {
                current += '"'
                i++
            } else {
                inQuotes = !inQuotes
            }
            continue
        }

        if (char === ',' && !inQuotes) {
            values.push(current)
            current = ""
            continue
        }

        current += char
    }

    values.push(current)
    return values
}

const parseCsvText = (text) => {
    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)

    if (lines.length === 0) {
        return []
    }

    const headers = parseCsvLine(lines[0])
    return lines.slice(1).map((line) => {
        const values = parseCsvLine(line)
        const row = {}
        headers.forEach((header, index) => {
            row[header] = values[index] ?? ""
        })
        return row
    })
}

const start = async () => {
    try {
        const file = fs.readFileSync("./DB.csv", "utf8")
        jsonDB = parseCsvText(file)
        app.listen(port, () => {
            console.log(`app is listening on port ${port}`)
        })
    } catch (error) {
        console.error("Failed to start server:", error)
        process.exit(1)
    }
}

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

app.get("/api/v1/getData", requireApiKey, (req, res) => {
    if (!allowDataExport) {
        return res.status(403).json({ message: "Data export is disabled" })
    }

    try {
        const file = fs.readFileSync("./DB.csv", "utf8")
        res.status(200).type("text/csv").send(file)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Failed to read data" })
    }
})

app.post("/api/v1/postData", requireApiKey, async (req, res) => {
    try {
        const { id } = req.body
        if (!isValidId(id)) {
            return res.status(400).json({ message: "Please provide a valid ID" })
        }

        let person = null
        for (let i = 0; i < jsonDB.length; i++) {
            if (id === jsonDB[i].id) {
                if (jsonDB[i].checked === "true") {
                    return res.status(409).json({ message: "Person already checked" })
                }

                jsonDB[i].checked = "true"
                person = jsonDB[i]
                break
            }
        }

        if (!person) {
            return res.status(404).json({ message: "Person not found" })
        }

        try {
            const csvContent = serializeRowsToCsv(jsonDB)
            fs.writeFileSync("./DB.csv", csvContent)
            return res.status(200).json({
                email: person.email,
                username: person.username,
                teamName: person.teamName,
                tShirt: person.tShirt
            })
        } catch (err) {
            console.error("Failed to persist csv:", err)
            return res.status(500).json({ message: "Failed to persist check-in state" })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Unexpected server error" })
    }
})

start()
