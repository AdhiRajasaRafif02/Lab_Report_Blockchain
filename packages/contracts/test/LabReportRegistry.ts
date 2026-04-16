import { expect } from "chai";
import { ethers } from "hardhat";

describe("LabReportRegistry", function () {
  it("registers a document", async function () {
    const factory = await ethers.getContractFactory("LabReportRegistry");
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const hash = ethers.keccak256(ethers.toUtf8Bytes("sample"));

    await contract.registerDocument(
      "DOC-001",
      hash,
      "report.pdf",
      "blood_test",
      "Campus Lab",
      "lab_staff"
    );

    const record = await contract.getByDocumentId("DOC-001");
    expect(record.exists).to.equal(true);
    expect(record.revoked).to.equal(false);
    expect(record.fileHash).to.equal(hash);
  });
});
