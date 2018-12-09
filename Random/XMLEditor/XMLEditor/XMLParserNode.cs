using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace XMLEditor
{
	public interface IParserNode<Node>
	{
		Node Instantiate(Node parent, string name, Dictionary<string, string> attributes = null);
		string Name
		{
			get;
			set;
		}
		string Content
		{
			get;
			set;
		}
		List<Node> Children
		{
			get;
		}
		StringBuilder Serialize(Verbosity verbose, StringBuilder serializedString = null, uint depth = 0);
		void Destroy();
	}

	public class XMLParserNode
	{
		public class TreeNode : IParserNode<TreeNode>
		{
			public string name;
			public string content;
			public Dictionary<string, string> attributes;
			private List<TreeNode> children = new List<TreeNode>();

			public virtual List<TreeNode> Children
			{
				get
				{
					return children;
				}
			}
			public virtual string Name
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
			public virtual string Content
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

			public TreeNode(string name, Dictionary<string, string> attributes = null, TreeNode parent = null)
			{
				this.name = name;
				this.content = "";
				this.attributes = attributes ?? new Dictionary<string, string>();
				if(parent != null)
					parent.children.Add(this);
			}

			/// <summary>
			/// Use XMLParser.Clear() instead of this, or remember to call GC.Collect() afterwards
			/// </summary>
			public virtual void Destroy()
			{
				name = null;
				content = null;
				attributes.Clear();
				attributes = null;

				for(int i = 0; i < children.Count; i++)
					children.ElementAt(i).Destroy();

				children.Clear();
				children = null;
			}

			/// <summary>
			/// Serialize element tree into XML text representation
			/// </summary>
			/// <param name="verbose">None, Newline, NewlineAndIndent</param>
			/// <param name="serializedString">Internally pased value</param>
			/// <param name="depth">Internal counter</param>
			/// <returns>XML string</returns>
			public virtual StringBuilder Serialize(Verbosity verbose, StringBuilder serializedString = null, uint depth = 0)
			{
				serializedString = serializedString ?? new StringBuilder();
				bool hasContent = children.Count > 0 || content != "";

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
					foreach(var child in children)
						child.Serialize(verbose, serializedString, depth + 1u);

					if(verbose == Verbosity.NewlineAndIndent)
						serializedString.Append(new string(' ', (int) ((depth) * 2u)));
					serializedString.Append("</").Append(name).Append('>');
					if(verbose == Verbosity.NewlineAndIndent || verbose == Verbosity.Newline)
						serializedString.Append('\n');
				}

				return serializedString;
			}

			public TreeNode Instantiate(TreeNode parent, string name, Dictionary<string, string> attributes = null)
			{
				return new TreeNode(name, attributes, parent);
			}

			public TreeNode() { }
		}
	}
}
