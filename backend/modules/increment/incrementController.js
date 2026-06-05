const Increment = require("../../models/Increment");
const Employee = require("../../models/Employee");
const Designation = require("../../models/Designation");

exports.getAllIncrements = async (req, res) => {
  try {
    const companyId = req.user.company_id;
    
    const increments = await Increment.find()
      .populate("employee_id", "name email designation designation_id salary company_id")
      .sort({ effective_date: -1 });
    
    const filtered = increments.filter(inc => 
      inc.employee_id?.company_id?.toString() === companyId
    );
    
    res.json({ success: true, data: filtered });
  } catch (err) {
    console.error("Error fetching increments:", err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
};

exports.createIncrement = async (req, res) => {
  try {
    const {
      employee_id,
      type,
      old_salary,
      new_salary,
      old_designation,
      new_designation,
      new_designation_id,
      effective_date,
      remarks
    } = req.body;
    
    console.log("Received increment/promotion request:", {
      employee_id,
      type,
      old_salary,
      new_salary,
      new_designation,
      new_designation_id
    });
  
    const oldSalaryNum = parseFloat(old_salary);
    const newSalaryNum = parseFloat(new_salary);
    if (isNaN(oldSalaryNum)) {
      return res.status(400).json({ error: "Invalid old salary value" });
    }
    
    if (type === "increment" && (isNaN(newSalaryNum) || newSalaryNum <= 0)) {
      return res.status(400).json({ error: "Please enter a valid new salary amount" });
    }
    
    if (type === "increment" && newSalaryNum <= oldSalaryNum) {
      return res.status(400).json({ error: "New salary must be greater than current salary" });
    }
    
    if (type === "promotion" && newSalaryNum < oldSalaryNum) {
      return res.status(400).json({ error: "New salary cannot be less than current salary" });
    }
    const incrementData = {
      employee_id,
      type,
      old_salary: oldSalaryNum,
      new_salary: type === "increment" ? newSalaryNum : (isNaN(newSalaryNum) ? oldSalaryNum : newSalaryNum),
      effective_date,
      remarks: remarks || "",
      created_by: req.user.id
    };
  
    if (old_designation) incrementData.old_designation = old_designation;
    if (new_designation) incrementData.new_designation = new_designation;
    
    const increment = new Increment(incrementData);
    await increment.save();
    
    const updateData = {};

    if (type === "increment") {
      updateData.salary = newSalaryNum;
      console.log(`Updating salary for employee ${employee_id}: ${oldSalaryNum} -> ${newSalaryNum}`);
    } else if (type === "promotion" && !isNaN(newSalaryNum) && newSalaryNum !== oldSalaryNum) {
      updateData.salary = newSalaryNum;
      console.log(`Updating salary for employee ${employee_id}: ${oldSalaryNum} -> ${newSalaryNum}`);
    }
    

    if (type === "promotion" && new_designation) {
      let designationRecord = null;
      
      if (new_designation_id) {
        designationRecord = await Designation.findOne({ 
          _id: new_designation_id,
          company_id: req.user.company_id 
        });
      }
      if (!designationRecord) {
        designationRecord = await Designation.findOne({ 
          designation_name: new_designation,
          company_id: req.user.company_id 
        });
      }
      
      if (designationRecord) {
        updateData.designation_id = designationRecord._id;
        updateData.designation = designationRecord.designation_name;
        console.log(`Updating designation for employee ${employee_id}: ${old_designation} -> ${designationRecord.designation_name} (ID: ${designationRecord._id})`);
      } else {
        updateData.designation = new_designation;
        console.log(`Updating designation for employee ${employee_id}: ${old_designation} -> ${new_designation} (no ID found)`);
      }
    }
    if (Object.keys(updateData).length > 0) {
      const updatedEmployee = await Employee.findByIdAndUpdate(
        employee_id, 
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!updatedEmployee) {
        console.error(`Employee not found with ID: ${employee_id}`);
        return res.status(404).json({ error: "Employee not found" });
      }
      
      console.log("Employee updated successfully:", {
        employee_id: updatedEmployee._id,
        name: updatedEmployee.name,
        oldSalary: oldSalaryNum,
        newSalary: updatedEmployee.salary,
        oldDesignation: old_designation,
        newDesignation: updatedEmployee.designation,
        designationId: updatedEmployee.designation_id
      });
    } else {
      console.log("No updates needed for employee");
    }
    
    res.status(201).json({ 
      success: true, 
      data: increment,
      message: `${type === "increment" ? "Increment" : "Promotion"} added successfully`
    });
  } catch (err) {
    console.error("Create increment error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getEmployeeHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const employee = await Employee.findOne({ user_id: userId });
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        error: "Employee record not found" 
      });
    }
    
    const history = await Increment.find({ 
      employee_id: employee._id 
    }).sort({ effective_date: -1 });
    
    res.json({ success: true, data: history });
  } catch (err) {
    console.error("Error fetching employee history:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

exports.getEmployeeHistoryById = async (req, res) => {
  try {
    const { employee_id } = req.params;
    
    const history = await Increment.find({ 
      employee_id 
    }).sort({ effective_date: -1 });
    
    res.json({ success: true, data: history });
  } catch (err) {
    console.error("Error fetching history by ID:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

exports.deleteIncrement = async (req, res) => {
  try {
    const { id } = req.params;
    
    const increment = await Increment.findById(id);
    if (!increment) {
      return res.status(404).json({ error: "Record not found" });
    }
    
    await Increment.findByIdAndDelete(id);
    
    res.json({ success: true, message: "Record deleted successfully" });
  } catch (err) {
    console.error("Error deleting increment:", err);
    res.status(500).json({ error: "Failed to delete record" });
  }
};