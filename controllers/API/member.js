const { memberModel, loansModel, repaymentModel, AccountModel, TransactionsModel, RepaymentDetails } = require('../../models/restdb');
const { allusersModel, ExpenseModel, categoryModel, Revenue, walletModel, memberidsModel, loanidModel, accountidModel } = require("../../models/logindb");
const mongoose = require('mongoose');

const updateMember = async (req, res) => {
  const memberId = req.params.id;

  // Fetch existing member details from the database
  const existingMember = await memberModel.findById(memberId);
  if (!existingMember) {
    return res.status(404).json({ message: "Member not found" });
  }

  // Destructure the request body containing member details
  const {
    memberNo,
    fullName,
    email,
    branchName,
    fatherName,
    gender,
    maritalStatus,
    dateOfBirth,
    currentAddress,
    permanentAddress,
    whatsAppNo,
    nomineeName,
    relationship,
    nomineeMobileNo,
    nomineeDateOfBirth,
    walletId,
    numberOfShares,
    photo,
    idProof,
    signature,
  } = req.body;

  try {
    // Determine whether to use existing URLs or new URLs from the request
    let photoUrl = photo || existingMember.photo || "";
    let idProofUrl = idProof || existingMember.idProof || "";

    // Check if photo file is uploaded
    if (req.files && req.files["photo"] && req.files["photo"][0]) {
      const formDataWithImages = new FormData();
      formDataWithImages.append("imageone", req.files["photo"][0].buffer, {
        filename: req.files["photo"][0].originalname,
      });

      const responseUpload = await axios.post(
        `${API_BASE_URL}/uploadimage`,
        formDataWithImages,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      photoUrl = responseUpload.data.urls[0];
    }

    // Check if idProof file is uploaded
    if (req.files && req.files["idProof"] && req.files["idProof"][0]) {
      const formDataWithImages = new FormData();
      formDataWithImages.append("imageone", req.files["idProof"][0].buffer, {
        filename: req.files["idProof"][0].originalname,
      });

      const responseUpload = await axios.post(
        `${API_BASE_URL}/uploadimage`,
        formDataWithImages,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      idProofUrl = responseUpload.data.urls[0];
    }

    // Find and update member details in the database
    const updatedMember = await memberModel.findByIdAndUpdate(
      memberId,
      {
        memberNo,
        fullName,
        email,
        branchName,
        fatherName,
        gender,
        maritalStatus,
        dateOfBirth,
        currentAddress,
        permanentAddress,
        whatsAppNo,
        nomineeName,
        relationship,
        nomineeMobileNo,
        nomineeDateOfBirth,
        walletId,
        numberOfShares,
        photo: photoUrl,
        idProof: idProofUrl,
        signature,
      },
      { new: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res
      .status(200)
      .json({ message: "Member updated successfully", data: updatedMember });
  } catch (error) {
    // // console.error("Error updating member:", error);
    res.status(500).json({ message: "Error updating member" });
  }
};

const deleteMember = async (req, res) => {
  const memberId = req.params.id;
  try {
    const deletedMember = await memberModel.findByIdAndDelete(memberId);

    if (!deletedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res
      .status(200)
      .json({ message: "Member deleted successfully", data: deletedMember });
  } catch (error) {
    // // console.error("Error deleting member:", error);
    res.status(500).json({ message: "Error deleting member" });
  }
};

const readMembers = async (req, res) => {
  try {
    const allMembers = await memberModel.find();

    res.status(200).json({
      message: "All members retrieved successfully",
      data: allMembers,
    });
  } catch (error) {
    console.error("Error retrieving members:", error);

    // If it's not a specific type of error, provide a generic error message
    res.status(500).json({
      message: "Error retrieving members",
      error: error.message, // Include the specific error message
    });
  }
};

const readMembersName = async (req, res) => {
  try {
    const allMembers = await memberModel.find({}, "fullName"); // Fetch 'firstName' and 'lastName' fields

    const memberNames = allMembers.map((member) => ({
      name: `${member.fullName}`, // Concatenate 'firstName' and 'lastName'
    }));

    res.status(200).json({
      message: "All member names retrieved successfully",
      data: memberNames,
    });
  } catch (error) {
    // // console.error("Error retrieving member names:", error);
    res.status(500).json({ message: "Error retrieving member names" });
  }
};

const readMemberIds = async (req, res) => {
  try {
    const allMembers = await memberModel.find({}, "memberNo"); // Fetch only the '_id' field

    const memberIds = allMembers.map((member) => ({
      id: member.memberNo, // Retrieve '_id' field
    }));

    res.status(200).json({
      message: "All member IDs retrieved successfully",
      data: memberIds,
    });
  } catch (error) {
    // // console.error("Error retrieving member IDs:", error);
    res.status(500).json({ message: "Error retrieving member IDs" });
  }
};

const getMemberById = async (req, res) => {
  const memberId = req.params.id;

  try {
    // Find the member by ID in your MongoDB database using Mongoose
    const member = await memberModel.findById(memberId);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // If the member is found, send it as a response
    res.status(200).json(member);
  } catch (error) {
    // // console.error("Error retrieving member:", error);
    res.status(500).json({ message: "Error retrieving member" });
  }
};

const countMembersHandler = async (req, res) => {
  try {
    const count = await memberModel.countDocuments();

    res.status(200).json({ count });
  } catch (error) {
    // // console.error("Error counting members:", error);
    res.status(500).json({ message: "Error counting members" });
  }
};

const getAllMemberImagesHandler = async (req, res) => {
  try {
    // Find all documents in the 'members' collection where 'photo' and 'idProof' fields exist and are not null or empty
    const allMemberImages = await memberModel.find(
      {
        $or: [
          { photo: { $exists: true, $ne: null, $ne: "" } },
          { idProof: { $exists: true, $ne: null, $ne: "" } },
        ],
      },
      ["photo", "idProof"]
    );

    // Extract image URLs from the retrieved documents
    const imageUrls = allMemberImages.reduce((acc, member) => {
      if (member.photo) {
        acc.push(member.photo);
      }
      if (member.idProof) {
        acc.push(member.idProof);
      }
      return acc;
    }, []);

    res.status(200).json({ imageUrls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  updateMember,
  deleteMember,
  readMembers,
  readMembersName,
  readMemberIds,
  getMemberById,
  countMembersHandler,
  getAllMemberImagesHandler
};
