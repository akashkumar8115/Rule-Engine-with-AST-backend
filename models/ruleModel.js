const mongoose = require('mongoose');

const RuleSchema = new mongoose.Schema({
  ruleString: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Basic validation for rule string format
        return /^[(\w\s<>=!&|)]+$/.test(v);
      },
      message: 'Invalid rule string format'
    }
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  ast: {
    type: Object,
    required: true
  },
  attributes: [{
    type: String,
    enum: ['age', 'department', 'salary', 'experience', 'spend']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Rule', RuleSchema);