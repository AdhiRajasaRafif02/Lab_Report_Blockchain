// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LabReportRegistry {
    struct DocumentRecord {
        string documentId;
        bytes32 fileHash;
        string fileName;
        string documentType;
        string institutionName;
        string uploaderRole;
        uint256 uploadedAt;
        bool exists;
        bool revoked;
        string revokedReason;
        uint256 revokedAt;
    }

    address public owner;
    mapping(string => DocumentRecord) private recordsByDocumentId;
    mapping(bytes32 => string) private documentIdByHash;

    event DocumentRegistered(
        string indexed documentId,
        bytes32 indexed fileHash,
        string fileName,
        string documentType,
        string institutionName,
        string uploaderRole,
        uint256 uploadedAt
    );

    event DocumentRevoked(
        string indexed documentId,
        bytes32 indexed fileHash,
        string reason,
        uint256 revokedAt
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerDocument(
        string calldata documentId,
        bytes32 fileHash,
        string calldata fileName,
        string calldata documentType,
        string calldata institutionName,
        string calldata uploaderRole
    ) external {
        require(bytes(documentId).length > 0, "Document ID required");
        require(fileHash != bytes32(0), "Hash required");
        require(!recordsByDocumentId[documentId].exists, "Document already registered");
        require(bytes(documentIdByHash[fileHash]).length == 0, "Hash already registered");

        DocumentRecord memory record = DocumentRecord({
            documentId: documentId,
            fileHash: fileHash,
            fileName: fileName,
            documentType: documentType,
            institutionName: institutionName,
            uploaderRole: uploaderRole,
            uploadedAt: block.timestamp,
            exists: true,
            revoked: false,
            revokedReason: "",
            revokedAt: 0
        });

        recordsByDocumentId[documentId] = record;
        documentIdByHash[fileHash] = documentId;

        emit DocumentRegistered(
            documentId,
            fileHash,
            fileName,
            documentType,
            institutionName,
            uploaderRole,
            block.timestamp
        );
    }

    function revokeDocument(string calldata documentId, string calldata reason) external onlyOwner {
        DocumentRecord storage record = recordsByDocumentId[documentId];
        require(record.exists, "Document not found");
        require(!record.revoked, "Already revoked");

        record.revoked = true;
        record.revokedReason = reason;
        record.revokedAt = block.timestamp;

        emit DocumentRevoked(documentId, record.fileHash, reason, block.timestamp);
    }

    function getByDocumentId(string calldata documentId) external view returns (DocumentRecord memory) {
        return recordsByDocumentId[documentId];
    }

    function getByHash(bytes32 fileHash) external view returns (DocumentRecord memory) {
        string memory documentId = documentIdByHash[fileHash];
        return recordsByDocumentId[documentId];
    }
}
