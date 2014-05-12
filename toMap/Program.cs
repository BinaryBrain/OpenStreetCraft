using System;
using System.Threading;
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

			
			IList<int> elevations = o.SelectToken("elevation-flat").Select(s => (int)s).ToList();

			Console.WriteLine ("Load Elevations...");
			string dest = args [0];

			AnvilWorld world = AnvilWorld.Open (dest);
			BlockManager bm = world.GetBlockManager ();

			bm.AutoLight = true;
		

			// Set Elevations
			int i = 0;

			while (i < elevations.Count) {
				if (i % 100 == 0) {
					Console.WriteLine(i);
					//RegionChunkManager cm = world.GetChunkManager();
					//cm.RelightDirtyChunks();

				}
				int el = elevations [i];
				int y = i % 1001;
				int x = i / 1001 | 0;
				//x -= 500;
				//y -= 500;
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
	

			Console.WriteLine ("Load Mods");
			IList<int> mods = o.SelectToken("mods").Select(s => (int)s).ToList();

			Console.WriteLine (mods.Count);
			i = 0;
			while (i < mods.Count - 4) {
				int y = (int)mods [i++];
				int x = (int)mods [i++];
				int z = (int)mods [i++];
				int t = (int)mods [i++];
		
				if (t > 126) {
					Console.WriteLine ("Failled");
					Console.WriteLine (t);
					Console.WriteLine (x);
					Console.WriteLine (y);
					Console.WriteLine (z);
					continue;
				}
				//x -= 500;
				//y -= 500;
				// Check if valid block
				if (t < 256 && z > 0 && z <= 255) {
					bm.SetID (y, z, x, t);

				}
			}
			Console.WriteLine ("over generation");
	
			//	RegionChunkManager cm2 = world.GetChunkManager();
			//cm2.RelightDirtyChunks();

			world.Save();
		}
    }
}
