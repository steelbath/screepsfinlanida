using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace XMLEditor
{
	/// <summary>
	/// Copy of TreeElement class with Windows Forms extensions
	/// </summary>
	public class FormsXMLParserNode : TreeNode, IParserNode<FormsXMLParserNode>
	{
		public string name;
		public string content;
		public Dictionary<string, string> attributes;
		// private List<KeyValuePair<int, FormsXMLParserNode>> hidden = new List<KeyValuePair<int, FormsXMLParserNode>>();
		// private volatile static Dictionary<FormsXMLParserNode, FormsXMLParserNode> toBeHidden
		//	= new Dictionary<FormsXMLParserNode, FormsXMLParserNode>();

		public new string Name
		{
			get
			{
				return name;
			}
			set
			{
				name = value;
			}
		}
		public string Content
		{
			get
			{
				return content;
			}
			set
			{
				content = value;
			}
		}
		public List<FormsXMLParserNode> Children
		{
			get
			{
				var children = new List<FormsXMLParserNode>();
				foreach(FormsXMLParserNode child in Nodes)
					children.Add(child);
				return children;
			}
		}

		/*
		public void QueueHideChild(FormsXMLParserNode child)
		{
			toBeHidden.Add(this, child);
		}

		public void HideChildren()
		{
			FormsXMLParserNode[] keys = new FormsXMLParserNode[0];
			toBeHidden.Keys.CopyTo(keys, 0);
			List<FormsXMLParserNode> keysToRemove = new List<FormsXMLParserNode>();
			foreach(var key in keys)
			{
				FormsXMLParserNode _parent = key;
				if(toBeHidden.ContainsKey(key))
					while(_parent != null)
					{
						if(_parent.Parent != null)
							keysToRemove.Add(_parent);
						_parent = (FormsXMLParserNode) _parent.Parent;
					}
			}
			foreach(var attr in toBeHidden)
				attr.Key.HideChild(attr.Value);
		}
		
		public void ShowChildren()
		{
			foreach(var attr in toBeHidden)
				attr.Key.ShowChild();
			toBeHidden.Clear();
		}
		*/

		private int SortKVPair(KeyValuePair<int, FormsXMLParserNode> p1, KeyValuePair<int, FormsXMLParserNode> p2)
		{
			if(p1.Key > p2.Key)
				return 1;
			return -1;
		}

		public void HideChild(FormsXMLParserNode child)
		{
			/*
			int index = Nodes.IndexOf(child);
			KeyValuePair<int, FormsXMLParserNode> pair = new KeyValuePair<int, FormsXMLParserNode>(index, child);
			hidden.Add(pair);
			Nodes.RemoveAt(index);
			*/
		}

		public void ShowChild()
		{
			/*
			hidden.Sort(SortKVPair);
			foreach(var attr in hidden)
				Nodes.Insert(attr.Key, attr.Value);
			hidden.Clear();
			*/
		}

		public FormsXMLParserNode(string name, Dictionary<string, string> attributes = null, FormsXMLParserNode parent = null)
		{
			this.name = string.Intern(name);
			this.content = "";
			this.attributes = attributes ?? new Dictionary<string, string>();
			this.Text = name;
			
			if(parent != null)
				parent.Nodes.Add(this);
		}

		/// <summary>
		/// Use XMLParser.Clear() instead of this, or remember to call GC.Collect() afterwards
		/// </summary>
		public void Destroy()
		{
			name = null;
			content = null;
			attributes.Clear();
			attributes = null;

			for(int i = 0; i < Nodes.Count; i++)
				((FormsXMLParserNode) Nodes[i]).Destroy();

			Nodes.Clear();
		}

		/// <summary>
		/// Serialize element tree into XML text representation
		/// </summary>
		/// <param name="verbose">None, Newline, NewlineAndIndent</param>
		/// <param name="serializedString">Internally pased value</param>
		/// <param name="depth">Internal counter</param>
		/// <returns>XML string</returns>
		public StringBuilder Serialize(Verbosity verbose, StringBuilder serializedString = null, uint depth = 0)
		{
			serializedString = serializedString ?? new StringBuilder();
			bool hasContent = Nodes.Count > 0 || content != "";

			if(verbose == Verbosity.NewlineAndIndent)
				serializedString.Append(new string(' ', (int) (depth * 2u)));
			serializedString.Append('<').Append(name);
			foreach(var obj in attributes)
				serializedString.Append(' ')
								.Append(obj.Key)
								.Append("=\"")
								.Append(obj.Value)
								.Append('\"');

			if(hasContent)
				serializedString.Append(">");
			else
				serializedString.Append("/>");

			if(verbose == Verbosity.NewlineAndIndent || verbose == Verbosity.Newline)
				serializedString.Append('\n');

			if(hasContent)
			{
				string[] contentLines = content.Split('\n');
				foreach(string _line in contentLines)
				{
					string line = _line.Trim();
					if(line != "")
					{
						if(verbose == Verbosity.NewlineAndIndent)
							serializedString.Append(new string(' ', (int) ((depth + 1u) * 2u)));
						serializedString.Append(line);
						if(verbose == Verbosity.NewlineAndIndent || verbose == Verbosity.Newline)
							serializedString.Append('\n');
					}
				}
				foreach(FormsXMLParserNode child in Nodes)
					child.Serialize(verbose, serializedString, depth + 1u);

				if(verbose == Verbosity.NewlineAndIndent)
					serializedString.Append(new string(' ', (int) ((depth) * 2u)));
				serializedString.Append("</").Append(name).Append('>');
				if(verbose == Verbosity.NewlineAndIndent || verbose == Verbosity.Newline)
					serializedString.Append('\n');
			}

			return serializedString;
		}

		public FormsXMLParserNode Instantiate(FormsXMLParserNode parent, string name, Dictionary<string, string> attributes = null)
		{
			return new FormsXMLParserNode(name, attributes, parent);
		}

		public FormsXMLParserNode() { }
	}
}
