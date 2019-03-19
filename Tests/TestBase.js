// Set module to by pass NPM module exports which dont exist in testing context
module = {};
module.exports = {};

// Initialize screep Game placeholder
Game = {};
Game.cpu = {};
Game.cpu.getUsed = function(){return 0;}

class TestBase
{
    constructor()
    {
        var tests = 0;
        var fails = [];
        var funcs = this.getAllFuncs();

        for(var index in funcs)
        {
            var funcName = funcs[index];
            if(funcName.startsWith("test") && funcName.length > 4)
                try {
                    tests++;
                    this.setUp();
                    this[funcName]();
                }
                catch(exc){
                    fails.push(exc);
                }
        }

        if(fails.length)
        {
            console.log(fails.length + "/" + tests + " tests failed.");
            for(var i in fails)
                console.log(fails[i]);
        }
        else
            console.log(tests + " tests succesful.");
    }

    setUp()
    {
        throw "You must setUp your test cases";
    }

    getAllFuncs() {
        /* FROM: https://stackoverflow.com/questions/31054910/get-functions-methods-of-a-class */
        let methods = [];
        let obj = this;
        while (obj = Reflect.getPrototypeOf(obj)) {
        let keys = Reflect.ownKeys(obj)
            keys.forEach((k) => methods.push(k));
        }
        return methods;
    }

    _compareObjects(obj1, obj2)
    {
        /* FROM: https://gomakethings.com/check-if-two-arrays-or-objects-are-equal-with-javascript/ */

        // Get the value type
        var type = Object.prototype.toString.call(obj1);

        // If the two objects are not the same type, return false
        if (type !== Object.prototype.toString.call(obj2))
            return false;

        // If items are not an object or array, return false
        if (['[object Array]', '[object Object]'].indexOf(type) < 0)
            return obj1 == obj2;

        // Compare the length of the length of the two items
        var valueLen = type === '[object Array]' ? obj1.length : Object.keys(obj1).length;
        var otherLen = type === '[object Array]' ? obj2.length : Object.keys(obj2).length;
        if (valueLen !== otherLen) return false;

        // Compare two items
        var compare = function (item1, item2) {

            // Get the object type
            var itemType = Object.prototype.toString.call(item1);

            // If an object or array, compare recursively
            if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
                if (!isEqual(item1, item2)) return false;
            }

            // Otherwise, do a simple comparison
            else {

                // If the two items are not the same type, return false
                if (itemType !== Object.prototype.toString.call(item2)) return false;

                // Else if it's a function, convert to a string and compare
                // Otherwise, just compare
                if (itemType === '[object Function]') {
                    if (item1.toString() !== item2.toString()) return false;
                } else {
                    if (item1 !== item2) return false;
                }

            }
        };

        // Compare properties
        if (type === '[object Array]') {
            for (var i = 0; i < valueLen; i++) {
                if (compare(obj1[i], obj2[i]) === false) return false;
            }
        } else {
            for (var key in obj1) {
                if (obj1.hasOwnProperty(key)) {
                    if (compare(obj1[key], obj2[key]) === false) return false;
                }
            }
        }

        // If nothing failed, return true
        return true;
    }

    _objToString(obj)
    {
        if(typeof obj === "object")
            return JSON.stringify(obj);
        return obj.toString();
    }

    assertEqual(obj1, obj2)
    {
        if(!this._compareObjects(obj1, obj2))
            throw new Error(this._objToString(obj1) + " is not equal with " + this._objToString(obj2));
    }

    assertNotEqual(obj1, obj2)
    {
        if(this._compareObjects(obj1, obj2))
            throw new Error(this._objToString(obj1) + " shouldn't be equal with " + this._objToString(obj2));
    }

    assertTrue(obj)
    {
        if(!obj)
            throw new Error(this._objToString(obj) + " is not true");
    }

    assertFalse(obj)
    {
        if(obj)
            throw new Error(this._objToString(obj)  + " is not false");
    }
}
