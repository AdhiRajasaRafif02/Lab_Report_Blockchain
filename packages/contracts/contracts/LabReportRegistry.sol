// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LabReportRegistry {
    struct Document {
        string documentId;
        bytes32 fileHash;
        string fileName;
        string documentType;
        address uploader;
        string institutionName;
        uint256 registeredAt;
        bool isRevoked;
        string revokedReason;
    }

    struct DocumentStatus {
        bool exists;
        bool isRevoked;
        string revocationReason;
    }

    address public immutable owner;
    mapping(address => bool) public authorizedRegistrars;
    mapping(string => Document) private recordsByDocumentId;
    mapping(bytes32 => string) private documentIdByHash;

    event DocumentRegistered(
        string indexed documentId,
        bytes32 indexed fileHash,
        address indexed uploader,
        string fileName,
        string documentType,
        string institutionName,
        uint256 registeredAt
    );

    event DocumentVerificationChecked(
        string indexed documentId,
        bytes32 indexed fileHash,
        bool exists,
        bool isRevoked
    );

    event DocumentRevoked(
        string indexed documentId,
        bytes32 indexed fileHash,
        address indexed revokedBy,
        string reason,
        uint256 revokedAt
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyRegistrar() {
        require(authorizedRegistrars[msg.sender], "Only authorized registrar");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedRegistrars[msg.sender] = true;
    }

    function setRegistrar(address registrar, bool isAuthorized) external onlyOwner {
        require(registrar != address(0), "Invalid registrar");
        authorizedRegistrars[registrar] = isAuthorized;
    }

    function registerDocument(
        string calldata documentId,
        bytes32 fileHash,
        string calldata fileName,
        string calldata documentType,
        string calldata institutionName
    ) external onlyRegistrar {
        require(bytes(documentId).length > 0, "Document ID required");
        require(fileHash != bytes32(0), "Hash required");
        require(bytes(fileName).length > 0, "File name required");
        require(bytes(documentType).length > 0, "Document type required");
        require(bytes(recordsByDocumentId[documentId].documentId).length == 0, "Document already registered");
        require(bytes(documentIdByHash[fileHash]).length == 0, "Hash already registered");

        Document memory record = Document({
            documentId: documentId,
            fileHash: fileHash,
            fileName: fileName,
            documentType: documentType,
            uploader: msg.sender,
            institutionName: institutionName,
            registeredAt: block.timestamp,
            isRevoked: false,
            revokedReason: ""
        });

        recordsByDocumentId[documentId] = record;
        documentIdByHash[fileHash] = documentId;

        emit DocumentRegistered(
            documentId,
            fileHash,
            msg.sender,
            fileName,
            documentType,
            institutionName,
            block.timestamp
        );
    }

    function getDocumentByHash(bytes32 fileHash) public view returns (Document memory) {
        string memory documentId = documentIdByHash[fileHash];
        return recordsByDocumentId[documentId];
    }

    function getDocumentById(string calldata documentId) public view returns (Document memory) {
        return recordsByDocumentId[documentId];
    }

    function verifyDocumentHash(bytes32 fileHash) external returns (bool exists, bool isRevoked, string memory documentId) {
        documentId = documentIdByHash[fileHash];
        exists = bytes(documentId).length > 0;
        isRevoked = exists && recordsByDocumentId[documentId].isRevoked;

        emit DocumentVerificationChecked(documentId, fileHash, exists, isRevoked);
        return (exists, isRevoked, documentId);
    }

    function revokeDocument(string calldata documentId, string calldata reason) external onlyOwner {
        Document storage record = recordsByDocumentId[documentId];
        require(bytes(record.documentId).length > 0, "Document not found");
        require(!record.isRevoked, "Already revoked");
        require(bytes(reason).length > 0, "Reason required");

        record.isRevoked = true;
        record.revokedReason = reason;

        emit DocumentRevoked(documentId, record.fileHash, msg.sender, reason, block.timestamp);
    }

    function getDocumentStatus(string calldata documentId) external view returns (DocumentStatus memory) {
        Document memory doc = recordsByDocumentId[documentId];
        bool exists = bytes(doc.documentId).length > 0;
        return DocumentStatus({
            exists: exists,
            isRevoked: exists ? doc.isRevoked : false,
            revocationReason: exists ? doc.revokedReason : ""
        });
    }
}
