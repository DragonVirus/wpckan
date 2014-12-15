const DATASET_ID_ATTR = "wpckan-dataset-id";
const DATASET_TITLE_ATTR = "wpckan-dataset-title";
const DATASET_URL_ATTR = "wpckan-dataset-url";
const CKAN_URL = "wpckan-base-url"

var field;
var datasetList;
var addButton;

var datasets = [];

jQuery( document ).ready(function() {
  console.log("wpckan_metabox_logic.js document ready");

  getFormValue();

  //Init div elements
  field = jQuery('#wpckan_related_datasets_add_field');
  datasetList = jQuery('#wpckan_related_datasets_list');
  addButton = jQuery("#wpckan_related_datasets_add_button");

  clearField();
  addButton.addClass("disabled");

  // Instantiate the Bloodhound suggestion engine
  var suggestions = new Bloodhound({
    datumTokenizer: function (datum) {
      return Bloodhound.tokenizers.whitespace(datum.value);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: field.attr(CKAN_URL) + '3/action/package_search?q=%QUERY',
      filter: function (json) {
        if (json.success){
          return jQuery.map(json.result.results, function (dataset) {
            return {
              id: dataset["id"],
              title: dataset["title"],
              url: dataset["url"]
            };
          });
        }
      }
    }
  });

  // Initialize the Bloodhound suggestion engine
  suggestions.initialize();

  // Instantiate the Typeahead UI
  jQuery('.typeahead').typeahead(null, {
    highlight: true,
    displayKey: 'title',
    source: suggestions.ttAdapter()
  }).on("typeahead:selected",function(event,item,dataset){
    console.log(item["id"]);
    console.log(item["title"]);
    console.log(item["url"]);
    jQuery(this).attr(DATASET_ID_ATTR,item["id"]);
    jQuery(this).attr(DATASET_TITLE_ATTR,item["title"]);
    jQuery(this).attr(DATASET_URL_ATTR,item["url"]);
    addButton.removeClass("disabled");
  });

  // TODO improve
  jQuery('.delete').on("click",function(){
    var dataset_id = jQuery(this).attr(DATASET_ID_ATTR);
    removeDatasetWithIdForEntry(dataset_id,this);
  });

});

function wpckan_related_dataset_metabox_on_input(){
  console.log("wpckan_related_dataset_metabox_on_input");

  addButton.addClass("disabled");
}

function wpckan_related_dataset_metabox_add(){
  console.log("wpckan_related_dataset_metabox_add");

  var dataset_id = field.attr(DATASET_ID_ATTR);
  var dataset_title = field.attr(DATASET_TITLE_ATTR);
  var dataset_url = field.attr(DATASET_URL_ATTR);

  var dataset = getDatasetWithId(dataset_id);
  if (dataset){
    clearField();
    return;
  }

  addDataset(dataset_id,dataset_title,dataset_url);
  clearField();

  var entry = jQuery('<p><a href='+dataset_url+'>'+dataset_title+'</a>   </p>');
  var del = jQuery('<a class="delete error" '+DATASET_ID_ATTR+'='+dataset_id+' href="#">Delete</a>');
  // TODO improve
  jQuery(del).on("click",function(){
    var dataset_id = jQuery(this).attr(DATASET_ID_ATTR);
    removeDatasetWithIdForEntry(dataset_id,this);
  });
  entry.append(del);

  datasetList.append(entry);
}

function getFormValue(){
  var datasets_json = jQuery("#wpckan_add_related_datasets_datasets").val();
  console.log("getFormValue "+ datasets_json);
  datasets = JSON.parse(datasets_json);
}

function setFormValue(){
  var datasets_json = JSON.stringify(datasets);
  console.log("setFormValue "+ datasets_json);
  jQuery("#wpckan_add_related_datasets_datasets").val(datasets_json);
}

function addDataset(dataset_id,dataset_title,dataset_url){
  datasets.push({"dataset_id": dataset_id, "dataset_title": dataset_title, "dataset_url": dataset_url});
  console.log("Added dataset with id: " + dataset_id + " datasets in array: "+ datasets.length);
  setFormValue();
}

//TODO optimize (using lodash)
function removeDatasetWithIdForEntry(id,entry){
  entry.parentNode.remove();  //use plain javascript here to get the parent
  var datasetIndex = getDatasetIndexWithId(id);
  if (datasetIndex){
    console.log("removing " + id + " from datasets");
    datasets.splice(datasetIndex,1);
    setFormValue();
    return;
  }

}

//TODO optimize (using lodash)
function getDatasetWithId(id){
  for (index in datasets){
    if (datasets[index]["dataset_id"] == id){
      return datasets[index];
    }
  }
  return null;
}

//TODO optimize (using lodash)
function getDatasetIndexWithId(id){
  for (index in datasets){
    if (datasets[index]["dataset_id"] == id){
      return index;
    }
  }
  return null;
}

function clearField(){
  field.val("");
}