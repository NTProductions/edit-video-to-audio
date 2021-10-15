// edit videos to audio



var window = new Window("palette", "Edit Video to Audio", undefined);
window.orientation = "column";

var groupOne = window.add("group", undefined, "groupOne");
groupOne.orientation = "row";
var wText = groupOne.add("statictext", undefined, "W");
var wEditText = groupOne.add("edittext", undefined, "1920");
wEditText.characters = 4;
var hText = groupOne.add("statictext", undefined, "H");
var hEditText = groupOne.add("edittext", undefined, "1080");
hEditText.characters = 4;

var groupTwo = window.add("group", undefined, "groupTwo");
groupTwo.orientation = "row";
var audioItemText = groupTwo.add("statictext", undefined, "Audio Item:");
var audioItemsDD = groupTwo.add("dropdownlist", undefined, audioItemsNames);
audioItemsDD.size = [200, 25];

var groupThree = window.add("group", undefined, "groupThree");
groupThree.orientation = "row";
var startText = groupThree.add("statictext", undefined, "Start (secs):");
var startEditText = groupThree.add("edittext", undefined, "0");
startEditText.characters = 3;
var endText = groupThree.add("statictext", undefined, "End (secs):");
var endEditText = groupThree.add("edittext", undefined, "0");
endEditText.characters = 3;

var groupFour = window.add("group", undefined, "groupFour");
groupFour.orientation = "row";
var footageFolderText = groupFour.add("statictext", undefined, "Footage Folder Item:");
var footageFolderDD = groupFour.add("dropdownlist", undefined, footageFoldersNames);
footageFolderDD.size = [160, 25];

var groupFive = window.add("group", undefined, "groupFive");
groupFive.orientation = "row";
var numEditsText = groupFive.add("statictext", undefined, "Num Edits:");
var numEditsSlider = groupFive.add("slider", undefined, "");
numEditsSlider.minvalue = 1;
numEditsSlider.maxvalue = 100;
numEditsSlider.value = 10;
var numEditsSliderText = groupFive.add("statictext", undefined, "10");
numEditsSliderText.characters = 3;

numEditsSlider.onChanging = function() {
    numEditsSliderText.text = parseInt(numEditsSlider.value);
}

var groupSix = window.add("group", undefined, "groupSix");
groupSix.orientation = "row";
var outputEditText = groupSix.add("edittext", undefined, "Output");
outputEditText.size = [220, 25];
var outputButton = groupSix.add("button", undefined, "...");
outputButton.size = [25, 25];

var groupSeven = window.add("group", undefined, "groupSeven");
groupSeven.orientation = "row";
var refreshButtonOne = groupSeven.add("button", undefined, "!");
refreshButtonOne.size = [25, 25];
var createButton = groupSeven.add("button", undefined, "Create");

window.center();
window.show();

var audioItems = [];
var audioItemsNames = [];

var footageFolders = [];
var footageFoldersNames = [];

refreshClick();

function getAudioItems() {
    audioItems = [];
    audioItemsNames = [];


    for(var i = 1; i <= app.project.numItems; i++) {
        if(app.project.item(i).name.toLowerCase().indexOf(".wav") != -1 || app.project.item(i).name.toLowerCase().indexOf(".mp3") != -1) {
            audioItems.push(app.project.item(i));
            audioItemsNames.push(app.project.item(i).name);
        }
    }
}

function getFootageFolders() {
    footageFolders = [];
    footageFoldersNames = [];

    for(var i = 1; i <= app.project.numItems; i++) {
        if(app.project.item(i) instanceof FolderItem) {
           if(app.project.item(i).numItems > 0) {
            footageFolders.push(app.project.item(i));
            footageFoldersNames.push(app.project.item(i).name);
        }
        }
    }
}

function refreshClick() {
    getAudioItems();
    getFootageFolders();

    audioItemsDD.removeAll();
    footageFolderDD.removeAll();

    for(var i = 0; i < audioItemsNames.length; i++) {
        audioItemsDD.add("item", audioItemsNames[i]);
    }

    if(audioItemsNames.length > 0) {
        audioItemsDD.selection = 0;
    }

    for(var i = 0; i < footageFoldersNames.length; i++) {
        footageFolderDD.add("item", footageFoldersNames[i]);
    }

    if(footageFoldersNames.length > 0) {
        footageFolderDD.selection = 0;
    }
}

refreshButtonOne.onClick = function() {
    refreshClick();
}

createButton.onClick = function() {
    if(!Folder(outputEditText.text).exists) {
        alert("Please select a valid output folder");
        return false;
    } else {
        main(parseInt(wEditText.text), parseInt(hEditText.text), audioItems[audioItemsDD.selection.index], parseInt(startEditText.text), parseInt(endEditText.text), footageFolders[footageFolderDD.selection.index], parseInt(numEditsSliderText.text), Folder(outputEditText.text));
    }
}

function main(w, h, audioItem, startSeconds, endSeconds, footageFolderItem, numEdits, outputFolderObj) {
    app.beginUndoGroup("Auto Edit to Music");

    var footageItems = [];

    for(var f = 1; f <= footageFolderItem.numItems; f++) {
        if(footageFolderItem.name.toLowerCase().indexOf(".mp4")!= -1 || footageFolderItem.name.toLowerCase().indexOf(".mov")!= -1 || footageFolderItem.name.toLowerCase().indexOf(".avi")!= -1 || footageFolderItem.name.toLowerCase().indexOf(".wmv")!= -1) {
            footageItems.push(footageFolderItem.item(f));
        }
    }

    var comp, audioLayer;
    for(var a = 0; a < numEdits; a++) {
        // create comp
        comp = app.project.items.addComp("My Edit_"+(a+1).toString(), w, h, 1, endSeconds-startSeconds, 30);

        // add audio
        audioLayer = comp.layers.add(audioItem);
        audioLayer.startTime = -startSeconds;

        // find audio cut points/areas of interest
        

        // do basic editing
        generateBasicEdit();

        // transitions
        generateTransitions();

        // effects
        generateEffects();

        // render
        ameRender(comp, outputFolderObj);
        }

    app.endUndoGroup();
}