import axios from "axios";
import mongoose from "mongoose";
import { DocumentChunk } from "../models/DocumentChunk.js";

export const askQuestion = async (req, res) => {
    try {
        const { question, documentId } = req.body;

        // Validate input
        if (!question || question.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Question is required."
            });
        }

        // ============================================
        // Generate embedding for the user's question
        // ============================================
        const embeddingResponse = await axios.post(
            `${process.env.OCR_SERVER_URL}/embed`,
            {
                text: question
            }
        );

        const questionEmbedding = embeddingResponse.data.embedding;

        if (!questionEmbedding) {
            return res.status(500).json({
                success: false,
                message: "Failed to generate question embedding."
            });
        }

        // ============================================
        // Build Vector Search Pipeline
        // ============================================
        const vectorSearchStage = {
            index: "document_embedding_index",
            path: "embedding",
            queryVector: questionEmbedding,
            numCandidates: 300,
            limit: 10
        };

        // Search only inside the selected document
        if (
            documentId &&
            mongoose.Types.ObjectId.isValid(documentId)
        ) {
            vectorSearchStage.filter = {
                documentId: new mongoose.Types.ObjectId(documentId)
            };
        }

        // ============================================
        // Retrieve relevant chunks
        // ============================================
        const chunks = await DocumentChunk.aggregate([
            {
                $vectorSearch: vectorSearchStage
            },
            {
                $project: {
                    text: 1,
                    chunkIndex: 1,
                    documentId: 1,
                    score: {
                        $meta: "vectorSearchScore"
                    }
                }
            }
        ]);

        if (chunks.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No relevant notes found."
            });
        }

        // ============================================
        // Create context for Gemini
        // ============================================
        const context = chunks
            .map(chunk => chunk.text)
            .join("\n\n");

        // ============================================
        // Ask Gemini using retrieved context
        // ============================================
        const chatResponse = await axios.post(
            `${process.env.OCR_SERVER_URL}/chat`,
            {
                context,
                question
            }
        );

        // ============================================
        // Return answer
        // ============================================
        return res.status(200).json({
            success: true,
            question,
            answer: chatResponse.data.answer,
            sources: chunks
        });

    } catch (error) {

        console.error(
            "AI Controller Error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to answer question.",
            error: error.response?.data || error.message
        });
    }
};