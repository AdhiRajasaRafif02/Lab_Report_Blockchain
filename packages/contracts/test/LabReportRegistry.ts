import { expect } from "chai";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { ethers } from "hardhat";
import type { LabReportRegistry } from "../typechain-types/contracts/LabReportRegistry";

describe("LabReportRegistry", function () {
  async function deployFixture() {
    const [owner, registrar, outsider] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("LabReportRegistry");
    const contract = (await factory.deploy()) as LabReportRegistry;
    await contract.waitForDeployment();
    return { contract, owner, registrar, outsider };
  }

  const makeHash = (input: string) => ethers.keccak256(ethers.toUtf8Bytes(input));

  it("registers document successfully by authorized registrar", async function () {
    const { contract, owner } = await deployFixture();
    const hash = makeHash("report-1");

    await expect(
      contract
        .connect(owner)
        .registerDocument("DOC-001", hash, "report.pdf", "blood_test", "Campus Lab")
    )
      .to.emit(contract, "DocumentRegistered")
      .withArgs("DOC-001", hash, owner.address, "report.pdf", "blood_test", "Campus Lab", anyValue);

    const stored = await contract.getDocumentById("DOC-001");
    expect(stored.documentId).to.equal("DOC-001");
    expect(stored.fileHash).to.equal(hash);
    expect(stored.fileName).to.equal("report.pdf");
    expect(stored.documentType).to.equal("blood_test");
    expect(stored.uploader).to.equal(owner.address);
    expect(stored.institutionName).to.equal("Campus Lab");
    expect(stored.isRevoked).to.equal(false);
  });

  it("rejects duplicate hash registration", async function () {
    const { contract } = await deployFixture();
    const hash = makeHash("duplicate-hash");

    await contract.registerDocument("DOC-A", hash, "a.pdf", "xray", "Lab A");
    await expect(
      contract.registerDocument("DOC-B", hash, "b.pdf", "xray", "Lab B")
    ).to.be.revertedWith("Hash already registered");
  });

  it("supports valid lookups by hash and id", async function () {
    const { contract } = await deployFixture();
    const hash = makeHash("lookup-hash");
    await contract.registerDocument("DOC-LK", hash, "lookup.pdf", "urine_test", "Lab L");

    const byId = await contract.getDocumentById("DOC-LK");
    const byHash = await contract.getDocumentByHash(hash);
    expect(byId.documentId).to.equal("DOC-LK");
    expect(byHash.documentId).to.equal("DOC-LK");
    expect(byHash.fileHash).to.equal(hash);
  });

  it("revokes a document and returns revoked status", async function () {
    const { contract, owner } = await deployFixture();
    const hash = makeHash("revokable");
    await contract.registerDocument("DOC-RV", hash, "rv.pdf", "blood_test", "Lab Rev");

    await expect(contract.connect(owner).revokeDocument("DOC-RV", "Test invalidated"))
      .to.emit(contract, "DocumentRevoked")
      .withArgs("DOC-RV", hash, owner.address, "Test invalidated", anyValue);

    const status = await contract.getDocumentStatus("DOC-RV");
    expect(status.exists).to.equal(true);
    expect(status.isRevoked).to.equal(true);
    expect(status.revocationReason).to.equal("Test invalidated");
  });

  it("blocks unauthorized registration and revocation actions", async function () {
    const { contract, registrar, outsider } = await deployFixture();
    const hash = makeHash("unauthorized-actions");

    await expect(
      contract.connect(outsider).registerDocument("DOC-UA", hash, "u.pdf", "ct_scan", "Lab U")
    ).to.be.revertedWith("Only authorized registrar");

    await contract.setRegistrar(registrar.address, true);
    await contract.connect(registrar).registerDocument("DOC-UA", hash, "u.pdf", "ct_scan", "Lab U");

    await expect(contract.connect(registrar).revokeDocument("DOC-UA", "Not owner"))
      .to.be.revertedWith("Only owner");

    await expect(contract.connect(outsider).setRegistrar(outsider.address, true)).to.be.revertedWith(
      "Only owner"
    );
  });

  it("verifyDocumentHash returns existence and revoked flags", async function () {
    const { contract } = await deployFixture();
    const hash = makeHash("verify-me");

    const before = await contract.verifyDocumentHash.staticCall(hash);
    expect(before[0]).to.equal(false);
    expect(before[1]).to.equal(false);
    expect(before[2]).to.equal("");

    await contract.registerDocument("DOC-VF", hash, "vf.pdf", "blood_test", "Lab V");
    await expect(contract.verifyDocumentHash(hash))
      .to.emit(contract, "DocumentVerificationChecked")
      .withArgs("DOC-VF", hash, true, false);

    const afterReg = await contract.verifyDocumentHash.staticCall(hash);
    expect(afterReg[0]).to.equal(true);
    expect(afterReg[1]).to.equal(false);
    expect(afterReg[2]).to.equal("DOC-VF");

    await contract.revokeDocument("DOC-VF", "Revoked for audit");
    const afterRevoke = await contract.verifyDocumentHash.staticCall(hash);
    expect(afterRevoke[0]).to.equal(true);
    expect(afterRevoke[1]).to.equal(true);
    expect(afterRevoke[2]).to.equal("DOC-VF");
  });
});

