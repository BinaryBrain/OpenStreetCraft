using System;
using System.Linq;
using System.IO;
using System.Collections.Generic;
using Substrate;
using Substrate.Core;
using Newtonsoft.Json.Linq;

// This example replaces all instances of one block ID with another in a world.
// Substrate will handle all of the lower-level headaches that can pop up, such
// as maintaining correct lighting or replacing TileEntity records for blocks
// that need them.

// For a more advanced Block Replace example, see replace.cs in NBToolkit.

namespace BlockReplace
{
    class Program
    {
        static void Main (string[] args)
		{
			if (args.Length != 2) {
				Console.WriteLine ("Usage: BlockReplace <world> <jsonFile>");
				return;
			}

			StreamReader streamReader = new StreamReader(args [1]);
			string json = streamReader.ReadToEnd();
			streamReader.Close();

			JObject o = JObject.Parse(json);

			
			IList<int> elevations = o.SelectToken("elevation").Select(s => (int)s).ToList();

			string dest = args [0];

			AnvilWorld world = AnvilWorld.Open (dest);
			BlockManager bm = world.GetBlockManager ();

			bm.AutoLight = true;
		
			// Set Elevations
			int i = 0;
			while (i < elevations.Count) {
				int el = elevations [i];
				int x = i % 100;
				int y = i / 100 | 0;
				x -= 500;
				y -= 500;
				bm.SetID (x, el, y, (int)BlockType.GRASS);
				if (el > 1) {
					bm.SetID (x, el - 1, y, (int)BlockType.DIRT);
				}
				if (el > 2) {
					bm.SetID (x, el - 2, y, (int)BlockType.DIRT);
				}
				if (el > 3) {
					bm.SetID (x, el - 3, y, (int)BlockType.DIRT);
				}
				if (el > 4) {
					bm.SetID (x, el - 4, y, (int)BlockType.DIRT);
				}
				++i;
			}

			IList<int> mods = o.SelectToken("mods").Select(s => (int)s).ToList();


			i = 0;
			while (i < mods.Count) {
				int x = mods [i++];
				int y = mods [i++];
				int z = mods [i++];
				int t = mods [i++];
				x -= 500;
				y -= 500;
				// Check if valid block
				if (t < 256 && z >= 0 && z <= 256) {
					bm.SetID (x, z, y, t);
				}
			}

			Console.WriteLine ("over generation");

			bm.SetID (10, 10, 10, (int)BlockType.GRASS);
			RegionChunkManager cm = world.GetChunkManager();
			cm.RelightDirtyChunks();

			world.Save();
		}
    }
}
