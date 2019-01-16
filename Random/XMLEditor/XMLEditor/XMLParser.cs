using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Xml;

namespace XMLEditor
{
	public enum Verbosity
	{
		None,
		Newline,
		NewlineAndIndent
	}

	public class XMLParser<Node> where Node : IParserNode<Node>, new()
	{
		public int nodeCount = 0;
		private Node rootNode;

		public void ParseFile(FileStream xmlFile)
		{
			this.ReadXmlFile(xmlFile);
		}

		public void ParseFile(string filePath)
		{
			FileStream xmlFile = new FileStream(filePath, FileMode.Open);
			this.ReadXmlFile(xmlFile);
			xmlFile.Close();
			xmlFile = null;
		}

		void ReadXmlFile(FileStream xmlFile)
		{
			XmlReaderSettings settings = new XmlReaderSettings();
			uint layer = 0;
			using(XmlReader reader = XmlReader.Create(xmlFile, settings))
			{
				Dictionary<uint, Node> elementPath = new Dictionary<uint, Node>();
				while(reader.Read())
				{
					switch(reader.NodeType)
					{
						case XmlNodeType.Element:
							string name = reader.Name;
							Dictionary<string, string> attributes = new Dictionary<string, string>();
							bool addLayer = !reader.IsEmptyElement;
							if(reader.HasAttributes)
							{
								for(int x = 0; x < reader.AttributeCount; x++)
								{
									reader.MoveToNextAttribute();
									attributes.Add(
										string.Intern(reader.Name),
										string.Intern(reader.Value)
									);
								}
							}

							Node parentElement = layer > 0 ? elementPath[layer - 1u] : new Node();
							string.Intern(parentElement.Content ?? "");
							if(elementPath.ContainsKey(layer))
								elementPath[layer] = parentElement.Instantiate(parentElement, name, attributes);
							else
								elementPath.Add(layer, parentElement.Instantiate(parentElement, name, attributes));

							if(addLayer)
								// Is not self closing element>
								layer++;
							nodeCount++;
							break;
						case XmlNodeType.Text:
							Node elem = elementPath[layer - 1u];
							elem.Content += reader.Value;
							elementPath[layer - 1u] = elem;
							break;
						case XmlNodeType.EndElement:
							layer--;
							break;
						default:
							break;
					}
				}
				rootNode = elementPath[0];
				elementPath.Clear();
			}
		}

		private bool HasParsedFile()
		{
			return rootNode != null;
		}

		public void WriteFile(string filePath, Verbosity verbose = Verbosity.NewlineAndIndent)
		{
			if(!HasParsedFile())
				throw new ApplicationException("No file have been parsed!");

			if(!filePath.EndsWith(".xml"))
				filePath += ".xml";
			FileStream xmlFile = new FileStream(filePath, FileMode.Create);
			byte[] info = new UTF8Encoding(true).GetBytes(SerializeXmlTree(verbose));
			xmlFile.Write(info, 0, info.Length);
			xmlFile.Close();
			xmlFile = null;
		}

		public Node GetRootNode()
		{
			if(!HasParsedFile())
				throw new ApplicationException("No file have been parsed!");
			return rootNode;
		}

		public string SerializeXmlTree(Verbosity verbose)
		{
			if(!HasParsedFile())
				throw new ApplicationException("No file have been parsed!");

			StringBuilder builder = rootNode.Serialize(verbose);
			string serialized = builder.ToString();
			builder = null;
			GC.Collect();

			return serialized;
		}

		public void Clear()
		{
			rootNode.Destroy();
			GC.Collect();
		}
	}
}
