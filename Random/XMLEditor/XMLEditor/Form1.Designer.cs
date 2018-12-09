namespace XMLEditor
{
	partial class Form1
	{
		/// <summary>
		/// Required designer variable.
		/// </summary>
		private System.ComponentModel.IContainer components = null;

		/// <summary>
		/// Clean up any resources being used.
		/// </summary>
		/// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
		protected override void Dispose(bool disposing)
		{
			if(disposing && (components != null))
			{
				components.Dispose();
			}
			base.Dispose(disposing);
		}

		#region Windows Form Designer generated code

		/// <summary>
		/// Required method for Designer support - do not modify
		/// the contents of this method with the code editor.
		/// </summary>
		private void InitializeComponent()
		{
			this.LoadXML = new System.Windows.Forms.Button();
			this.label1 = new System.Windows.Forms.Label();
			this.openXMLFile = new System.Windows.Forms.OpenFileDialog();
			this.debugText = new System.Windows.Forms.TextBox();
			this.nodeDetails = new System.Windows.Forms.GroupBox();
			this.saveDetails = new System.Windows.Forms.Button();
			this.filterElements = new System.Windows.Forms.CheckBox();
			this.filterContent = new System.Windows.Forms.CheckBox();
			this.filterAttrKeys = new System.Windows.Forms.CheckBox();
			this.matchCase = new System.Windows.Forms.CheckBox();
			this.useRegExp = new System.Windows.Forms.CheckBox();
			this.filterAttrVals = new System.Windows.Forms.CheckBox();
			this.filterText = new System.Windows.Forms.TextBox();
			this.filtersLabel = new System.Windows.Forms.Label();
			this.treeView = new XMLEditor.XMLParserTreeView();
			this.nodeDetails.SuspendLayout();
			this.SuspendLayout();
			// 
			// LoadXML
			// 
			this.LoadXML.Location = new System.Drawing.Point(37, 188);
			this.LoadXML.Name = "LoadXML";
			this.LoadXML.Size = new System.Drawing.Size(259, 95);
			this.LoadXML.TabIndex = 0;
			this.LoadXML.Text = "Load XML File";
			this.LoadXML.UseVisualStyleBackColor = true;
			this.LoadXML.Click += new System.EventHandler(this.LoadXML_Click);
			// 
			// label1
			// 
			this.label1.AutoSize = true;
			this.label1.Font = new System.Drawing.Font("Microsoft Sans Serif", 20F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.label1.Location = new System.Drawing.Point(12, 62);
			this.label1.Name = "label1";
			this.label1.Size = new System.Drawing.Size(294, 63);
			this.label1.TabIndex = 1;
			this.label1.Text = "XML Editor";
			// 
			// openXMLFile
			// 
			this.openXMLFile.DefaultExt = "xml";
			this.openXMLFile.FileName = "xmlFile";
			this.openXMLFile.Filter = "XML files|*.xml";
			// 
			// debugText
			// 
			this.debugText.Enabled = false;
			this.debugText.Location = new System.Drawing.Point(25, 342);
			this.debugText.Name = "debugText";
			this.debugText.Size = new System.Drawing.Size(380, 31);
			this.debugText.TabIndex = 3;
			// 
			// nodeDetails
			// 
			this.nodeDetails.BackColor = System.Drawing.SystemColors.AppWorkspace;
			this.nodeDetails.Controls.Add(this.saveDetails);
			this.nodeDetails.Font = new System.Drawing.Font("Microsoft Sans Serif", 11.875F, System.Drawing.FontStyle.Underline, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.nodeDetails.Location = new System.Drawing.Point(1243, 99);
			this.nodeDetails.Name = "nodeDetails";
			this.nodeDetails.Size = new System.Drawing.Size(569, 1045);
			this.nodeDetails.TabIndex = 5;
			this.nodeDetails.TabStop = false;
			this.nodeDetails.Text = "Node details";
			// 
			// saveDetails
			// 
			this.saveDetails.Font = new System.Drawing.Font("Microsoft Sans Serif", 7.875F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.saveDetails.Location = new System.Drawing.Point(372, 8);
			this.saveDetails.Name = "saveDetails";
			this.saveDetails.Size = new System.Drawing.Size(178, 56);
			this.saveDetails.TabIndex = 0;
			this.saveDetails.Text = "Save changes";
			this.saveDetails.UseVisualStyleBackColor = true;
			this.saveDetails.Click += new System.EventHandler(this.SaveNodeDetailChanges);
			// 
			// filterElements
			// 
			this.filterElements.AutoSize = true;
			this.filterElements.Checked = true;
			this.filterElements.CheckState = System.Windows.Forms.CheckState.Checked;
			this.filterElements.Location = new System.Drawing.Point(847, -1);
			this.filterElements.Name = "filterElements";
			this.filterElements.Size = new System.Drawing.Size(185, 29);
			this.filterElements.TabIndex = 6;
			this.filterElements.Text = "Filter elements";
			this.filterElements.UseVisualStyleBackColor = true;
			// 
			// filterContent
			// 
			this.filterContent.AutoSize = true;
			this.filterContent.Location = new System.Drawing.Point(847, 34);
			this.filterContent.Name = "filterContent";
			this.filterContent.Size = new System.Drawing.Size(169, 29);
			this.filterContent.TabIndex = 7;
			this.filterContent.Text = "Filter content";
			this.filterContent.UseVisualStyleBackColor = true;
			// 
			// filterAttrKeys
			// 
			this.filterAttrKeys.AutoSize = true;
			this.filterAttrKeys.Checked = true;
			this.filterAttrKeys.CheckState = System.Windows.Forms.CheckState.Checked;
			this.filterAttrKeys.Location = new System.Drawing.Point(847, 69);
			this.filterAttrKeys.Name = "filterAttrKeys";
			this.filterAttrKeys.Size = new System.Drawing.Size(143, 29);
			this.filterAttrKeys.TabIndex = 8;
			this.filterAttrKeys.Text = "Filter keys";
			this.filterAttrKeys.UseVisualStyleBackColor = true;
			// 
			// matchCase
			// 
			this.matchCase.AutoSize = true;
			this.matchCase.Checked = true;
			this.matchCase.CheckState = System.Windows.Forms.CheckState.Checked;
			this.matchCase.Location = new System.Drawing.Point(1033, -1);
			this.matchCase.Name = "matchCase";
			this.matchCase.Size = new System.Drawing.Size(155, 29);
			this.matchCase.TabIndex = 9;
			this.matchCase.Text = "Match case";
			this.matchCase.UseVisualStyleBackColor = true;
			// 
			// useRegExp
			// 
			this.useRegExp.AutoSize = true;
			this.useRegExp.Location = new System.Drawing.Point(1033, 34);
			this.useRegExp.Name = "useRegExp";
			this.useRegExp.Size = new System.Drawing.Size(166, 29);
			this.useRegExp.TabIndex = 10;
			this.useRegExp.Text = "Regular exp.";
			this.useRegExp.UseVisualStyleBackColor = true;
			// 
			// filterAttrVals
			// 
			this.filterAttrVals.AutoSize = true;
			this.filterAttrVals.Checked = true;
			this.filterAttrVals.CheckState = System.Windows.Forms.CheckState.Checked;
			this.filterAttrVals.Location = new System.Drawing.Point(1033, 69);
			this.filterAttrVals.Name = "filterAttrVals";
			this.filterAttrVals.Size = new System.Drawing.Size(161, 29);
			this.filterAttrVals.TabIndex = 11;
			this.filterAttrVals.Text = "Filter values";
			this.filterAttrVals.UseVisualStyleBackColor = true;
			// 
			// filterText
			// 
			this.filterText.Location = new System.Drawing.Point(482, 62);
			this.filterText.Name = "filterText";
			this.filterText.Size = new System.Drawing.Size(336, 31);
			this.filterText.TabIndex = 12;
			this.filterText.TextChanged += new System.EventHandler(this.FilterTextChanged);
			this.filterText.KeyDown += new System.Windows.Forms.KeyEventHandler(this.FilterTextEnter);
			// 
			// filtersLabel
			// 
			this.filtersLabel.AutoSize = true;
			this.filtersLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 10.875F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.filtersLabel.Location = new System.Drawing.Point(476, 9);
			this.filtersLabel.Name = "filtersLabel";
			this.filtersLabel.Size = new System.Drawing.Size(104, 33);
			this.filtersLabel.TabIndex = 13;
			this.filtersLabel.Text = "Filters:";
			// 
			// treeView
			// 
			this.treeView.Indent = 10;
			this.treeView.Location = new System.Drawing.Point(465, 99);
			this.treeView.Name = "treeView";
			this.treeView.Size = new System.Drawing.Size(778, 1045);
			this.treeView.TabIndex = 4;
			this.treeView.Text = "Loaded XML Tree";
			this.treeView.AfterSelect += new System.Windows.Forms.TreeViewEventHandler(this.TreeViewAfterSelect);
			// 
			// Form1
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF(12F, 25F);
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
			this.ClientSize = new System.Drawing.Size(1824, 1157);
			this.Controls.Add(this.filtersLabel);
			this.Controls.Add(this.filterText);
			this.Controls.Add(this.filterAttrVals);
			this.Controls.Add(this.useRegExp);
			this.Controls.Add(this.matchCase);
			this.Controls.Add(this.filterAttrKeys);
			this.Controls.Add(this.filterContent);
			this.Controls.Add(this.filterElements);
			this.Controls.Add(this.nodeDetails);
			this.Controls.Add(this.treeView);
			this.Controls.Add(this.debugText);
			this.Controls.Add(this.label1);
			this.Controls.Add(this.LoadXML);
			this.Name = "Form1";
			this.Text = "XML Editor";
			this.Load += new System.EventHandler(this.Form1_Load);
			this.nodeDetails.ResumeLayout(false);
			this.ResumeLayout(false);
			this.PerformLayout();

		}

		#endregion

		private System.Windows.Forms.Button LoadXML;
		private System.Windows.Forms.Label label1;
		private System.Windows.Forms.OpenFileDialog openXMLFile;
		private System.Windows.Forms.TextBox debugText;
		private XMLParserTreeView treeView;
		private System.Windows.Forms.GroupBox nodeDetails;
		private System.Windows.Forms.Button saveDetails;
		private System.Windows.Forms.CheckBox filterElements;
		private System.Windows.Forms.CheckBox filterContent;
		private System.Windows.Forms.CheckBox filterAttrKeys;
		private System.Windows.Forms.CheckBox matchCase;
		private System.Windows.Forms.CheckBox useRegExp;
		private System.Windows.Forms.CheckBox filterAttrVals;
		private System.Windows.Forms.TextBox filterText;
		private System.Windows.Forms.Label filtersLabel;
	}
}

