using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace XMLEditor
{
	public partial class Form1 : Form
	{
		int menuYPos = 0;
		public FormsXMLParser parser;
		public FormsXMLParserNode selectedNode = null;
		TextBox nodeDetailName;
		TextBox nodeDetailContent;
		List<TextBox> nodeDetailAttributes = new List<TextBox>();
		List<TextBox> nodeDetailKeys = new List<TextBox>();
		List<Button> nodeDetailAttrDelBtns = new List<Button>();
		Button addAttribute = new Button();

		Action<string> debounceFilterNodes;

		public Form1()
		{
			InitializeComponent();
			parser = new FormsXMLParser();
		}

		private TextBox CreateTextBox(string label, Point location, Size size, string value = null, bool addLabel = true)
		{
			if(addLabel)
			{
				Label lbl = new Label();
				lbl.Location = location;
				lbl.Name = label;
				lbl.Size = new Size(50, 16);
				lbl.Text = label;
				Controls.Add(lbl);
				lbl.BringToFront();
				location.Y += 16;
			}

			TextBox tb = new TextBox();
			tb.Location = location;
			tb.Name = label;
			if(value != null)
				tb.Text = value;
			tb.Size = size;
			Controls.Add(tb);
			tb.BringToFront();
			return tb;
		}

		private bool MatchString(string query, string target)
		{
			if(query.Length > target.Length)
				return false;
			return (matchCase.Checked ? target : target.ToLower()).Contains(query);
		}

		private bool MatchString(Regex query, string target)
		{
			var match = query.Match(matchCase.Checked ? target : target.ToLower());
			return match.Success;
		}

		private bool FilterNode(FormsXMLParserNode node, string query, Regex reQuery)
		{
			bool match = false;
			// node.ShowChild();

			foreach(var child in node.Children)
				if(FilterNode(child, query, reQuery))
					match = true;
			
			if(!match && filterElements.Checked)
			{
				if(reQuery != null)
					match = MatchString(reQuery, node.name);
				else
					match = MatchString(query, node.name);
			}
			if(!match && filterContent.Checked)
			{
				if(reQuery != null)
					match = MatchString(reQuery, node.content);
				else
					match = MatchString(query, node.content);
			}
			if(!match && filterAttrKeys.Checked && filterAttrVals.Checked)
			{
				foreach(var attr in node.attributes)
				{
					if(reQuery != null)
						match = MatchString(reQuery, attr.Key);
					else
						match = MatchString(query, attr.Key);
					if(match)
						break;
					if(reQuery != null)
						match = MatchString(reQuery, attr.Value);
					else
						match = MatchString(query, attr.Value);
					if(match)
						break;
				}
			}
			else if(!match && filterAttrKeys.Checked)
			{
				foreach(var key in node.attributes.Keys)
				{
					if(reQuery != null)
						match = MatchString(reQuery, key);
					else
						match = MatchString(query, key);
					if(match)
						break;
				}
			}
			else if(!match && filterAttrVals.Checked)
			{
				foreach(var val in node.attributes.Values)
				{
					if(reQuery != null)
						match = MatchString(reQuery, val);
					else
						match = MatchString(query, val);
					if(match)
						break;
				}
			}

			if(!match && node.Parent != null)
			{
				// ((FormsXMLParserNode) node.Parent).HideChild(node);
				node.ForeColor = Color.White;
				// node.Collapse();
			}
			else
				node.ForeColor = Color.Black;

			return match;
		}

		private void FilterNodes(string query)
		{
			Regex reQuery = null;
			query = matchCase.Checked ? query : query.ToLower();
			if(useRegExp.Checked)
				reQuery = new Regex(query);

			FilterNode(parser.GetRootNode(), query, reQuery);
		}

		private void Form1_Load(object sender, EventArgs e)
		{
			nodeDetailName = CreateTextBox("Element", new Point(630, 80), new Size(270, 20));
			nodeDetailContent = CreateTextBox("Content", new Point(630, 120), new Size(270, 90));
			nodeDetailContent.Multiline = true;

			Label attrsLbl = new Label();
			attrsLbl.Location = new Point(630, 230);
			attrsLbl.Name = "Attributes";
			attrsLbl.Size = new Size(60, 16);
			attrsLbl.Text = "Attributes:";
			Controls.Add(attrsLbl);
			attrsLbl.BringToFront();

			attrsLbl = new Label();
			attrsLbl.Location = new Point(630, 250);
			attrsLbl.Name = "Key";
			attrsLbl.Size = new Size(50, 16);
			attrsLbl.Text = "Key:";
			Controls.Add(attrsLbl);
			attrsLbl.BringToFront();

			attrsLbl = new Label();
			attrsLbl.Location = new Point(770, 250);
			attrsLbl.Name = "Value";
			attrsLbl.Size = new Size(50, 16);
			attrsLbl.Text = "Value:";
			Controls.Add(attrsLbl);
			attrsLbl.BringToFront();

			addAttribute.Location = new Point(700, 280);
			addAttribute.Name = "addAttribute";
			addAttribute.Size = new Size(80, 26);
			addAttribute.Text = "Add attribute";
			Controls.Add(addAttribute);
			addAttribute.BringToFront();
			addAttribute.Click += new EventHandler(AddAttrRow);

			Action<string> action = (arg) => { FilterNodes(arg); };
			debounceFilterNodes = action.Debounce(1000);
		}

		private List<FormsXMLParserNode> GetTreeNodes(FormsXMLParserNode rootNode)
		{
			List<FormsXMLParserNode> nodes = new List<FormsXMLParserNode>();
			List<FormsXMLParserNode> children = new List<FormsXMLParserNode>();

			foreach(var child in rootNode.Children)
				children.AddRange(GetTreeNodes(child));

			/*
			string attrString = "";
			foreach(var obj in rootNode.attributes)
				attrString += string.Format(" {0}=\"{1}\"", obj.Key, obj.Value);

			string nodeText = string.Format("{0} ({1} ): {2}", rootNode.name, attrString, rootNode.content);
			*/
			nodes.Add(rootNode);
			nodes.AddRange(children.ToArray());
			
			return nodes;
		}

		private void LoadXML_Click(object sender, EventArgs e)
		{
			debugText.Text = "Loading file . . .";
			if(openXMLFile.ShowDialog() == DialogResult.OK)
			{
				debugText.Text = openXMLFile.FileName;
				parser.ParseFile(openXMLFile.FileName);
				//Console.WriteLine(parser.SerializeXmlTree(XMLParser.Verbosity.NewlineAndIndent));
				//var nodes = GetTreeNodes(parser.GetRootNode());
				// parser.WriteFile("test file", Verbosity.Newline);
				// parser.GetRootNode().Destroy();
				// GC.Collect();
				//treeView.Nodes.AddRange(nodes.ToArray());
				treeView.Nodes.Add(parser.GetRootNode());
			}
		}

		private void TreeViewAfterSelect(object sender, TreeViewEventArgs evt)
		{
			DisplayNodeDetails((FormsXMLParserNode) evt.Node);
		}

		private void MakeAttrRow(string key, string value, int index)
		{
			nodeDetailKeys.Add(CreateTextBox("key", new Point(630, menuYPos += 20), new Size(120, 20), key, false));
			nodeDetailAttributes.Add(CreateTextBox("value", new Point(770, menuYPos), new Size(120, 20), value, false));
			
			Button btn = new Button();
			btn.Location = new Point(890, menuYPos);
			btn.Name = index.ToString();
			btn.Size = new Size(20, 20);
			btn.Text = "X";
			btn.BackColor = Color.Red;
			Controls.Add(btn);
			nodeDetailAttrDelBtns.Add(btn);
			btn.BringToFront();
			btn.Click += new EventHandler(DeleteAttrRow);
			
			addAttribute.Location = new Point(700, menuYPos + 20);
		}

		private void ClearAttrRows()
		{
			foreach(var key in nodeDetailAttrDelBtns)
				Controls.Remove(key);
			foreach(var key in nodeDetailKeys)
				Controls.Remove(key);
			foreach(var key in nodeDetailAttributes)
				Controls.Remove(key);
			nodeDetailAttrDelBtns.Clear();
			nodeDetailKeys.Clear();
			nodeDetailAttributes.Clear();
		}

		private void DisplayNodeDetails(FormsXMLParserNode node)
		{
			selectedNode = node;
			nodeDetailName.Text = node.Name;
			nodeDetailContent.Text = node.Content;

			menuYPos = 155 + nodeDetailContent.Height;
			int i = 0;

			ClearAttrRows();
			foreach(var attr in node.attributes)
			{
				MakeAttrRow(attr.Key, attr.Value, i);
				i++;
			}
		}

		private void DeleteAttrRow(object sender, EventArgs evt)
		{
			Button btn = (Button) sender;
			int key = int.Parse(btn.Name);
			
			Controls.Remove(nodeDetailAttrDelBtns[key]);
			Controls.Remove(nodeDetailKeys[key]);
			Controls.Remove(nodeDetailAttributes[key]);
			nodeDetailAttrDelBtns.RemoveAt(key);
			nodeDetailKeys.RemoveAt(key);
			nodeDetailAttributes.RemoveAt(key);
			
			menuYPos = 155 + nodeDetailContent.Height;
			for(int i = 0; i < nodeDetailAttrDelBtns.Count; i++)
			{
				TextBox dKey = nodeDetailKeys[i];
				TextBox dAttr= nodeDetailAttributes[i];
				Button dBtn= nodeDetailAttrDelBtns[i];
				dKey.Location = new Point(dKey.Location.X, menuYPos += 20);
				dAttr.Location = new Point(dAttr.Location.X, menuYPos);
				dBtn.Location = new Point(dBtn.Location.X, menuYPos);
				dBtn.Name = i.ToString();
			}

			addAttribute.Location = new Point(700, menuYPos + 20);
		}

		private void AddAttrRow(object sender, EventArgs evt)
		{
			MakeAttrRow("key", "value", nodeDetailKeys.Count);
		}

		private void SaveNodeDetailChanges(object sender, EventArgs evt)
		{
			selectedNode.Text = nodeDetailName.Text;
			selectedNode.name = nodeDetailName.Text;
			selectedNode.content = nodeDetailContent.Text;
			selectedNode.attributes.Clear();
			for(int x = 0; x < nodeDetailKeys.Count; x++)
				selectedNode.attributes.Add(nodeDetailKeys[x].Text, nodeDetailAttributes[x].Text);
		}

		private void FilterTextChanged(object sender, EventArgs e)
		{
			// debounceFilterNodes(((TextBox) sender).Text);
		}

		private void FilterTextEnter(object sender, KeyEventArgs evt)
		{
			if(evt.KeyCode == Keys.Enter)
				FilterNodes(filterText.Text);
		}
	}

	public static class Utils
	{
		public static Action<T> Debounce<T>(this Action<T> func, int milliseconds = 300)
		{
			var last = 0;
			return arg =>
			{
				var current = Interlocked.Increment(ref last);
				Task.Delay(milliseconds).ContinueWith(task =>
				{
					if(current == last)
						func(arg);
					task.Dispose();
				});
			};
		}
	}

}
