const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId
 
// migrate data from AI-Model BE TO B2C BE
const axios = require("axios");
const Content = require("./models/content");
const connectDB = require('./config/db'); // DBConfig
// const mongoose = require('mongoose');
 
// Connect to the database
connectDB();
 
const fetchAllContent = async () => {
  try {
    const fetchedContent = await axios.get(`http://164.52.218.107/backend3/transcriptionspdf`);
   
    // Extract assigned_code values using map
    const apiAssignedCodes = fetchedContent.data.ACADEMICS.map(item => item.assigned_code);
 
    console.log(apiAssignedCodes, "API Assigned Codes");
 
    const existingAssignedCodes = await Content.find({});
    const dbAssignedCodes = existingAssignedCodes.map(item => item.assigned_code);
   
    // Filter out the assigned codes that are already present in the Content model
    const newAssignedCodes = apiAssignedCodes.filter(code => !dbAssignedCodes.includes(code));
    // Insert new values into the Content model
    for (const item of fetchedContent.data.ACADEMICS) {
      if (newAssignedCodes.includes(item.assigned_code)) {
        // Map field names and insert into Content model
        const newContent = new Content({
          title: extractActualName(item.name),
          description: "", // You can set a default description or leave it empty
          type: "pdf", // Assuming all content from the API is of type 'pdf'
          contentUrl: item.link,
          assigned_code: item.assigned_code,
          viewedAt: null, // You can set a default value or leave it null
          viewCount: 0, // You can set a default value or leave it 0
          createdAt: new Date(),
        });
       
        const ans = await newContent.save();
       
        console.log(`Inserted new content with assigned_code: ${item.assigned_code}`);
      }
    }
 
  } catch (error) {
    console.log(error);
  }
};
 
const extractActualName = (name) => {
  const nameParts = name.split(':');
  return nameParts[nameParts.length - 1].trim();
};
 
// fetchAllContent();
 
 
// -------------------xxxxxxxxxxxxxxx---------------xxxxxxxxxxxxxx-----------xxxxxxxxxxxx
 
 
// update category of records
const updateRecords = async () => {
    try {
      const assignedCodesToUpdate = [
 
        'ACK-PJEG0HGG'
 
      ]
          const categoriesToAdd = {
            "category": "grades",
        "subcategories": "6th grade",
        // "category": "subject",
        // "subcategories": "Health Science",
        // "category": "publisher",
        // "subcategories": "NCERT",
 
      };
  console.log(assignedCodesToUpdate.length)
      // Find and update records for each assigned code in the array
      for (const assignedCodeToUpdate of assignedCodesToUpdate) {
        const recordToUpdate = await Content.findOne({ assigned_code: assignedCodeToUpdate });
 
        if (recordToUpdate) {
          // Update the categories field
          recordToUpdate.categories.push(categoriesToAdd);
 
          // Save the updated record
          await recordToUpdate.save();
 z
          console.log(`Record with assigned_code ${assignedCodeToUpdate} updated successfully.`);
        } else {
          console.log(`Record with assigned_code ${assignedCodeToUpdate} not found.`);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      // Close the database connection
      mongoose.connection.close();
    }
  };
 
//   updateRecords();