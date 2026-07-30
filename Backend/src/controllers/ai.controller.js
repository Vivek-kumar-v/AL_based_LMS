import axios from "axios";
import mongoose from "mongoose";
import { DocumentChunk } from "../models/DocumentChunk.js";

export const askQuestion = async (req, res) => {
    try {
        const { question, documentId } = req.body;

        if (!question || question.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Question is required."
            });
        }

        let embeddingResponse;
        try {
            embeddingResponse = await axios.post(
                `${process.env.OCR_SERVER_URL}/embed`,
                { text: question }
            );
            console.log("✅ Embedding generated");
        } catch (err) {
            console.error("❌ Embed Error:", err.response?.status, err.response?.data);
            throw err;
        }


        const questionEmbedding = embeddingResponse.data.embedding;

        if (!questionEmbedding) {
            return res.status(500).json({
                success: false,
                message: "Failed to generate question embedding."
            });
        }

        const vectorSearchStage = {
            index: "document_embedding_index",
            path: "embedding",
            queryVector: questionEmbedding,
            numCandidates: 300,
            limit: 10
        };

        if (
            documentId &&
            mongoose.Types.ObjectId.isValid(documentId)
        ) {
            vectorSearchStage.filter = {
                documentId: new mongoose.Types.ObjectId(documentId)
            };
        }

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

        const context = chunks
            .map(chunk => chunk.text)
            .join("\n\n");

        
        let chatResponse;
        try {
            chatResponse = await axios.post(
                `${process.env.OCR_SERVER_URL}/chat`,
                { question, context }
            );
            console.log("✅ Chat response generated");
        } catch (err) {
            console.error("❌ Chat Error:", err.response?.status, err.response?.data);
            throw err;
        }

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

export const askQuestionFromAllNotes = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || question.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Question is required."
            });
        }

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
                message: "Failed to generate embedding."
            });
        }

        const chunks = await DocumentChunk.aggregate([
            {
                $vectorSearch: {
                    index: "document_embedding_index",
                    path: "embedding",
                    queryVector: questionEmbedding,
                    numCandidates: 300,
                    limit: 10,

                    filter: {
                        uploadedBy: new mongoose.Types.ObjectId(req.student._id)
                    }
                }
            },

            {
                $lookup: {
                    from: "documents",
                    localField: "documentId",
                    foreignField: "_id",
                    as: "document"
                }
            },

            {
                $unwind: "$document"
            },

            {
                $project: {
                    text: 1,
                    chunkIndex: 1,
                    score: {
                        $meta: "vectorSearchScore"
                    },

                    documentTitle: "$document.title",
                    subject: "$document.subject",
                    documentId: 1
                }
            }
        ]);

        if (!chunks.length) {
            return res.status(404).json({
                success: false,
                message: "No relevant notes found."
            });
        }

        const context = chunks
            .map(
                chunk =>
`Document: ${chunk.documentTitle}

${chunk.text}`
            )
            .join("\n\n----------------\n\n");

        const chatResponse = await axios.post(
            `${process.env.OCR_SERVER_URL}/chat`,
            {
                context,
                question
            }
        );

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