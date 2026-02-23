import express from "express";
import axios from "axios";
import "dotenv/config";

const app = express();
const PORT = 3001;

app.get("/figma/:fileKey/screens", async (req, res) => {
    const { fileKey } = req.params;

    const response = await axios.get(
        `https://api.figma.com/v1/files/${fileKey}`,
        {
            headers: { "X-Figma-Token": process.env.FIGMA_TOKEN }
        }
    );

    const screens: any[] = [];

    function extractFrames(node: any) {
        if (
            node.type === "FRAME" &&
            node.absoluteBoundingBox &&
            node.absoluteBoundingBox.width >= 375 &&
            node.absoluteBoundingBox.height >= 700
        ) {
            screens.push({
                id: node.id,
                name: node.name,
                width: node.absoluteBoundingBox.width,
                height: node.absoluteBoundingBox.height
            });
        }

        if (node.children) {
            node.children.forEach(extractFrames);
        }
    }

    extractFrames(response.data.document);

    res.json(screens);
});

app.get("/figma/:fileKey/screen/:nodeId", async (req, res) => {
    const { fileKey, nodeId } = req.params;

    const response = await axios.get(
        `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`,
        {
            headers: { "X-Figma-Token": process.env.FIGMA_TOKEN }
        }
    );

    res.json(response.data.nodes[nodeId]);
});

app.listen(PORT, () => {
    console.log(`MCP server rodando na porta ${PORT}`);
});