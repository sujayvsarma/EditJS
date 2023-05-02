## EditJS
EditJS is a Javascript/JQuery powered engine to minimize development of CRUD pages for data entry and viewing. Create a single page, attach EditJS to the page and it automatically adds just-in-time Edit controls. Edits are managed transparently by the EditJS. 

---

## Installing EditJS

- Download [dist.zip](dist.zip) from the root directory of this repo.  
  - If you are on Windows, after you download, right-click on the ZIP file, select Properties, and at the bottom of the first page, check ON "Unblock" and click OK. 

- Extract the contents of the ZIP file into your web project.
  - The /dependencies folder contains scripts of the latest version of other frameworks that is used by EditJS. Look at the version numbers mentioned in these files, if the versions of the files you have in your project are HIGHER than the ones in EditJS, you may safely use YOUR versions instead of the EditJS copies. 
  - You may place these files in any location you like. The only place you need to update locations is in /dependencies/fontawesome/fontawesome.min.css... this file contains relative directory references to the files in the /dependencies/webfonts folder (right at the bottom).

---

## Using EditJS

Look at the sample 'test.html' file. All controls and properties are described here. If you leave out a required property in your HTML, run the file and check -- EditJS will complain about it in the browser's (F12) Console window. If it is an optional property, EditJS will use a reasonable default. 

When in doubt, look at the code in /scripts/sujaysarma.editjs.js. The code is not obfuscated or minified. 
If you still have a question or problem, file a ticket in the ISSUES tab here and I will help you out.

Enjoy using EditJS !
