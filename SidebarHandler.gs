function doGet(e) {
  var template = HtmlService.createTemplateFromFile('sidebar');
  var htmlOutput = template.evaluate()
    .setTitle('Teametric Configuration');
  var content = htmlOutput.getContent();
  if (content.indexOf('id="sidebar-container"') === -1) {
    throw new Error('Sidebar container element not found');
  }
  return htmlOutput;
}

function saveConfig(config) {
  try {
    // Load JSON schema
    var files = DriveApp.getFilesByName('config.json');
    if (!files.hasNext()) {
      throw new Error('Configuration schema file not found');
    }
    var schema = JSON.parse(files.next().getBlob().getDataAsString());
    var schemaProps = schema.properties || {};
    var requiredFields = schema.required || [];
    var propsToSave = {};
    var errors = [];

    // Validate and collect
    Object.keys(schemaProps).forEach(function(key) {
      var propSchema = schemaProps[key];
      var value = config[key];
      if (value != null) {
        // Type validation
        if (propSchema.type === 'string' && typeof value !== 'string') {
          errors.push(key + ' must be a string');
          return;
        }
        if ((propSchema.type === 'integer' || propSchema.type === 'number') && !/^\d+$/.test(String(value))) {
          errors.push(key + ' must be a number');
          return;
        }
        // Enum validation
        if (propSchema.enum && propSchema.enum.indexOf(value) === -1) {
          errors.push(key + ' must be one of: ' + propSchema.enum.join(', '));
          return;
        }
        propsToSave[key] = String(value);
      } else if (requiredFields.indexOf(key) !== -1) {
        errors.push('Missing required field: ' + key);
      }
    });

    if (errors.length) {
      throw new Error(errors.join('; '));
    }

    PropertiesService.getScriptProperties().setProperties(propsToSave);
    return { success: true };
  } catch (err) {
    throw new Error('Failed to save configuration: ' + err.message);
  }
}