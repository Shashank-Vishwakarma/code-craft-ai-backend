import express, { Express } from "express"

const app: Express = express();

app.get("/", (req, res)=>{
    res.json({message: "Hello from code-craft-ai-backend"})
})

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})