/*
 * Version 1.5.5 - 11/21/2010
 *   1. Pushing back to catalog after Fatal bug fix and weekend in Web Distro
 * Version 1.5.4 - 11/19/2010
 *   1. Fixed a bug with JSON output, clinched_playoffs was added and moved
 *   the data around a bit
 * Version 1.5.3 - 10/04/2010
 *   1. Moved real-game stats from home to viewTeam
 * Version 1.5.2 - 10/01/2010
 *   1. Fixed bug where Washington was showing wrong opponent
 * Version 1.5.1 - 09/25/2010 - 09/28/2010
 *   1. Added real-game schedule for each player
 *      Doesn't show anything if a player is on bye
 *   2. Set all percentage stats to be rounded to the nearest whole number
 *   3. Changed Bye stat to always read "Bye Week" when displayed
 * Version 1.5.0 - 09/22/2010
 *   Submitting back into the standard Palm catalog
 * Version 1.4.5 - 09/11/2010 - 09/19/2010
 *   1. Removed % Owned from Team screen, value not lining up correctly when
 *      lists are refreshed
 *   2. Added team logos to the viewLeague scene.
 *   3. Added otherTeam scene for viewing other teams in a league and for
 *      viewing opponents stats
 *   4. Linked otherTeam scene to viewLeague scene and viewTeam scene
 *   5. Added otherPlayer for viewing current (week only) stats of a player
 *      from the otherTeam scene
 * Version 1.4.4 - 09/10/2010 - 09/10/2010
 *   1. Fixed viewTeam to not fetch scoreboard for leagues that start after week 1
 * Version 1.4.3 - 09/09/2010 - 09/09/2010
 *   1. Fixed bug where player stats didn't show up
 *   2. Added % Owned to player listing in viewTeam scene
 * Version 1.4.2 - 09/08/2010 - 09/08/2010
 *   1. Updated Metrix bulletin version
 * Version 1.4.1 - 09/07/2010 - 09/07/2010
 *   1. Fixed viewTeam to not hit API every time it loads, only when tapping
 *      refresh or when changing a player
 *   2. Fixed how Injured Reserv was handled when displayed and moving players
 *      in and out of IR
 * Version 1.4.0 - 09/06/2010 - 09/06/2010
 *   Initial release to Palm App Catalog
 * Version 1.3.6 - 09/06/2010 - 09/06/2010
 *   1. Added Metrix, using postDeviceData and checkBulletinBoard
 *   2. Added Help scene
 *   3. Changed first -> push to -> home to frist -> swap to -> home, disables
 *      back gesture from home scene
 * Version 1.3.5 - 09/05/2010 - 09/05/2010
 *   1. Fixed total position counting bug that showed 254 open positions on my
 *      team
 *   2. Fixed bug showing wrong league info in viewLeague
 *   3. Fixed bug for point leagues in the new viewTeam
 * Version 1.3.4 - 09/03/2010 - 09/04/2010
 *   1. Cut down to 2 API calls for gather data, roster changes still causes
 *      3 more API calls
 *   2. Switched transactions and messages in viewLeague
 * Version 1.3.3 - 09/03/2010 - 09/03/2010
 *   1. Fixed loop that assigned positions to the available positions when
 *      starting a player
 *   2. Now showing multiple unassigned positions of the same position
 *   3. Created a list to display unassigned positions
 *   4. Added link to Yahoo! Player Page in viewPlayer
 *   5. Added note to display if a player has notes
 * Version 1.3.2 - 09/02/2010 - 09/02/2010
 *   1. Added scrim and spinner to team scene when returning from player scene
 *   2. Added scrim and spinner to Team scene token refresh
 *   3. Included Team scene refresh in Team scene token refresh
 *   4. Added token refresh to team listing scene, including scrim and spinner
 *   5. Moved Bye down one line in Player listing
 *   6. Fixed status listing for NA and IR, placed next to bye
 *   7. Colored Bye red if it was the players Bye week
 *   8. Added alert for empty roster positions
 * Version 1.3.1 - 08/31/2010 - 09/01/2010
 *   1. Add Mojo Depot storage for permmenat cookie storage, in app still uses
 *      cookies
 *   2. Fixed positions so players could be assigned to flex positions
 *      (W/T, W/R, etc...)
 *   3. Added Bye week display to the player list in viewTeam
 * Version 1.3.0 - 08/14/2010 - 08/30/2010
 *   1. Build Roster Edit functions
 * Version 1.2.0 - 07/15/2010 - 08/13/2010
 *   1. Built League/Team Home screen
 *   2. Built Team Detail screen including seperate lists for starting lineup
 *      and benched players
 *   3. Refined API calls down to only 2 calls
 * Version 1.1.0 - 07/05/2010 - 07/15/2010
 *   1. Built OAuth functions
 * Version 1.0.0 - 07/05/2010
 *   Fantasy Sports - generated on 07/05/2010
 */
