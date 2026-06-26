# Multimodal Cross-Modal RAG for Indian Canine Pathology

A production-ready full-stack application and AI pipeline engineered to bridge the modality gap between computer vision and highly localized medical text retrieval.

## Core Architecture

* **Proprietary Core Encoders (In-House Developed):** Features a custom pre-trained Vision Transformer (ViT) for canine visual features and a domain-specific fine-tuned BERT model for veterinary text extraction—both fully developed in-house and frozen during the alignment phase to preserve core feature integrity.
* **Cross-Modal Alignment Bridge:** A custom contrastive linear projection layer trained to map our in-house ViT embeddings ($768\text{-D}$) directly into our fine-tuned BERT text embedding space ($512\text{-D}$).
* **Knowledge-Grounded RAG Engine:** A vectorized medical knowledge base stored in a FAISS index, providing hallucination-free Indian pharmacological and environmental treatment protocols.
* **Dual-Agent Data Synthesis Pipeline:** A robust Maker-Checker LLM architecture bounded by a hardcoded localized context dictionary to automatically generate aligned, biologically accurate training pairs.
* **Full-Stack Implementation:** Complete end-to-end stack executing raw image uploading, real-time matrix transformations, vector database querying, and localized treatment rendering.
