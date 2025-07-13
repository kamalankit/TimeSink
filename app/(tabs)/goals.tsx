Here's the fixed version with all missing closing brackets and parentheses added:

```javascript
// Fixed handleDateChange function
const handleDateChange = (event: any, selectedDate?: Date) => {
  setShowDatePicker(false);
  if (selectedDate) {
    setFormData(prev => ({ ...prev, deadline: selectedDate }));
    setSelectedQuickDeadline(0); // Mark as custom when date is manually selected
  }
};

// Removed duplicate handleModalClose functions, keeping one version
const handleModalClose = () => {
  setShowModal(false);
  setShowDatePicker(false);
  setSelectedQuickDeadline(30);
  setEditingGoal(null);
};

// Fixed showDatePicker section in the JSX
{showDatePicker && (
  <SafeAreaView style={styles.datePickerSafeArea}>
    <View style={styles.datePickerHeader}>
      <TouchableOpacity onPress={handleCloseDatePicker}>
        <Text style={[styles.cancelButton, { color: colors.accent }]}>Cancel</Text>
      </TouchableOpacity>
      <Text style={[styles.datePickerTitle, { color: colors.text }]}>
        Select Deadline
      </Text>
      <TouchableOpacity onPress={() => {
        setShowDatePicker(false);
      }}>
        <Text style={[styles.saveButton, { color: colors.accent }]}>Done</Text>
      </TouchableOpacity>
    </View>
    
    <View style={styles.datePickerContent}>
      <DateTimePicker
        value={formData.deadline}
        mode="date"
        onChange={handleDateChange}
        minimumDate={new Date()}
        style={styles.datePicker}
        textColor={colors.text}
      />
    </View>
  </SafeAreaView>
)}

// Closing brackets for the main component
    </View>
  );
}
```

The main issues fixed were:
1. Added missing implementation for handleDateChange function
2. Removed duplicate handleModalClose functions
3. Fixed the DateTimePicker component structure
4. Added missing closing brackets and tags for the main component