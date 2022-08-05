/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved. 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0  
 
THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, 
MERCHANTABLITY OR NON-INFRINGEMENT. 
 
See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */



/// <reference no-default-lib="true"/>


/////////////////////////////
/// ECMAScript APIs
/////////////////////////////

declare const NaN: number;
declare const Infinity: number;

/**
  * Evaluates JavaScript code and executes it.
  * @param x A String value that contains valid JavaScript code.
  */
declare function eval(x: string): any;

/**
  * Converts A string to an integer.
  * @param s A string to convert into a number.
  * @param radix A value between 2 and 36 that specifies the base of the number in numString.
  * If this argument is not supplied, strings with a prefix of '0x' are considered hexadecimal.
  * All other strings are considered decimal.
  */
declare function parseInt(s: string, radix?: number): number;

/**
  * Converts a string to a floating-point number.
  * @param string A string that contains a floating-point number.
  */
declare function parseFloat(string: string): number;

/**
  * Returns a Boolean value that indicates whether a value is the reserved value NaN (not a number).
  * @param number A numeric value.
  */
declare function isNaN(number: number): boolean;

/**
  * Determines whether a supplied number is finite.
  * @param number Any numeric value.
  */
declare function isFinite(number: number): boolean;

/**
  * Gets the unencoded version of an encoded Uniform Resource Identifier (URI).
  * @param encodedURI A value representing an encoded URI.
  */
declare function decodeURI(encodedURI: string): string;

/**
  * Gets the unencoded version of an encoded component of a Uniform Resource Identifier (URI).
  * @param encodedURIComponent A value representing an encoded URI component.
  */
declare function decodeURIComponent(encodedURIComponent: string): string;

/**
  * Encodes a text string as a valid Uniform Resource Identifier (URI)
  * @param uri A value representing an encoded URI.
  */
declare function encodeURI(uri: string): string;

/**
  * Encodes a text string as a valid component of a Uniform Resource Identifier (URI).
  * @param uriComponent A value representing an encoded URI component.
  */
declare function encodeURIComponent(uriComponent: string): string;

interface PropertyDescriptor {
    configurable?: boolean;
    enumerable?: boolean;
    value?: any;
    writable?: boolean;
    get?(): any;
    set?(v: any): void;
}

interface PropertyDescriptorMap {
    [s: string]: PropertyDescriptor;
}

interface Object {
    /** The initial value of Object.prototype.constructor is the standard built-in Object constructor. */
    constructor: Function;

    /** Returns a string representation of an object. */
    toString(): string;

    /** Returns a date converted to a string using the current locale. */
    toLocaleString(): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): Object;

    /**
      * Determines whether an object has a property with the specified name.
      * @param v A property name.
      */
    hasOwnProperty(v: string): boolean;

    /**
      * Determines whether an object exists in another object's prototype chain.
      * @param v Another object whose prototype chain is to be checked.
      */
    isPrototypeOf(v: Object): boolean;

    /**
      * Determines whether a specified property is enumerable.
      * @param v A property name.
      */
    propertyIsEnumerable(v: string): boolean;
}

interface ObjectConstructor {
    new(value?: any): Object;
    (): any;
    (value: any): any;

    /** A reference to the prototype for a class of objects. */
    readonly prototype: Object;

    /**
      * Returns the prototype of an object.
      * @param o The object that references the prototype.
      */
    getPrototypeOf(o: any): any;

    /**
      * Gets the own property descriptor of the specified object.
      * An own property descriptor is one that is defined directly on the object and is not inherited from the object's prototype.
      * @param o Object that contains the property.
      * @param p Name of the property.
    */
    getOwnPropertyDescriptor(o: any, p: string): PropertyDescriptor;

    /**
      * Returns the names of the own properties of an object. The own properties of an object are those that are defined directly
      * on that object, and are not inherited from the object's prototype. The properties of an object include both fields (objects) and functions.
      * @param o Object that contains the own properties.
      */
    getOwnPropertyNames(o: any): string[];

    /**
      * Creates an object that has the specified prototype or that has null prototype.
      * @param o Object to use as a prototype. May be null.
      */
    create(o: object | null): any;

    /**
      * Creates an object that has the specified prototype, and that optionally contains specified properties.
      * @param o Object to use as a prototype. May be null
      * @param properties JavaScript object that contains one or more property descriptors.
      */
    create(o: object | null, properties: PropertyDescriptorMap & ThisType<any>): any;

    /**
      * Adds a property to an object, or modifies attributes of an existing property.
      * @param o Object on which to add or modify the property. This can be a native JavaScript object (that is, a user-defined object or a built in object) or a DOM object.
      * @param p The property name.
      * @param attributes Descriptor for the property. It can be for a data property or an accessor property.
      */
    defineProperty(o: any, p: string, attributes: PropertyDescriptor & ThisType<any>): any;

    /**
      * Adds one or more properties to an object, and/or modifies attributes of existing properties.
      * @param o Object on which to add or modify the properties. This can be a native JavaScript object or a DOM object.
      * @param properties JavaScript object that contains one or more descriptor objects. Each descriptor object describes a data property or an accessor property.
      */
    defineProperties(o: any, properties: PropertyDescriptorMap & ThisType<any>): any;

    /**
      * Prevents the modification of attributes of existing properties, and prevents the addition of new properties.
      * @param o Object on which to lock the attributes.
      */
    seal<T>(o: T): T;

    /**
      * Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
      * @param o Object on which to lock the attributes.
      */
    freeze<T>(a: T[]): ReadonlyArray<T>;

    /**
      * Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
      * @param o Object on which to lock the attributes.
      */
    freeze<T extends Function>(f: T): T;

    /**
      * Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
      * @param o Object on which to lock the attributes.
      */
    freeze<T>(o: T): Readonly<T>;

    /**
      * Prevents the addition of new properties to an object.
      * @param o Object to make non-extensible.
      */
    preventExtensions<T>(o: T): T;

    /**
      * Returns true if existing property attributes cannot be modified in an object and new properties cannot be added to the object.
      * @param o Object to test.
      */
    isSealed(o: any): boolean;

    /**
      * Returns true if existing property attributes and values cannot be modified in an object, and new properties cannot be added to the object.
      * @param o Object to test.
      */
    isFrozen(o: any): boolean;

    /**
      * Returns a value that indicates whether new properties can be added to an object.
      * @param o Object to test.
      */
    isExtensible(o: any): boolean;

    /**
      * Returns the names of the enumerable properties and methods of an object.
      * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
      */
    keys(o: {}): string[];
}

/**
  * Provides functionality common to all JavaScript objects.
  */
declare const Object: ObjectConstructor;

/**
  * Creates a new function.
  */
interface Function {
    /**
      * Calls the function, substituting the specified object for the this value of the function, and the specified array for the arguments of the function.
      * @param thisArg The object to be used as the this object.
      * @param argArray A set of arguments to be passed to the function.
      */
    apply(this: Function, thisArg: any, argArray?: any): any;

    /**
      * Calls a method of an object, substituting another object for the current object.
      * @param thisArg The object to be used as the current object.
      * @param argArray A list of arguments to be passed to the method.
      */
    call(this: Function, thisArg: any, ...argArray: any[]): any;

    /**
      * For a given function, creates a bound function that has the same body as the original function.
      * The this object of the bound function is associated with the specified object, and has the specified initial parameters.
      * @param thisArg An object to which the this keyword can refer inside the new function.
      * @param argArray A list of arguments to be passed to the new function.
      */
    bind(this: Function, thisArg: any, ...argArray: any[]): any;

    /** Returns a string representation of a function. */
    toString(): string;

    prototype: any;
    readonly length: number;

    // Non-standard extensions
    arguments: any;
    caller: Function;
}

interface FunctionConstructor {
    /**
      * Creates a new function.
      * @param args A list of arguments the function accepts.
      */
    new(...args: string[]): Function;
    (...args: string[]): Function;
    readonly prototype: Function;
}

declare const Function: FunctionConstructor;

interface IArguments {
    [index: number]: any;
    length: number;
    callee: Function;
}

interface String {
    /** Returns a string representation of a string. */
    toString(): string;

    /**
      * Returns the character at the specified index.
      * @param pos The zero-based index of the desired character.
      */
    charAt(pos: number): string;

    /**
      * Returns the Unicode value of the character at the specified location.
      * @param index The zero-based index of the desired character. If there is no character at the specified index, NaN is returned.
      */
    charCodeAt(index: number): number;

    /**
      * Returns a string that contains the concatenation of two or more strings.
      * @param strings The strings to append to the end of the string.
      */
    concat(...strings: string[]): string;

    /**
      * Returns the position of the first occurrence of a substring.
      * @param searchString The substring to search for in the string
      * @param position The index at which to begin searching the String object. If omitted, search starts at the beginning of the string.
      */
    indexOf(searchString: string, position?: number): number;

    /**
      * Returns the last occurrence of a substring in the string.
      * @param searchString The substring to search for.
      * @param position The index at which to begin searching. If omitted, the search begins at the end of the string.
      */
    lastIndexOf(searchString: string, position?: number): number;

    /**
      * Determines whether two strings are equivalent in the current locale.
      * @param that String to compare to target string
      */
    localeCompare(that: string): number;

    /**
      * Matches a string with a regular expression, and returns an array containing the results of that search.
      * @param regexp A variable name or string literal containing the regular expression pattern and flags.
      */
    match(regexp: string | RegExp): RegExpMatchArray | null;

    /**
      * Replaces text in a string, using a regular expression or search string.
      * @param searchValue A string to search for.
      * @param replaceValue A string containing the text to replace for every successful match of searchValue in this string.
      */
    replace(searchValue: string | RegExp, replaceValue: string): string;

    /**
      * Replaces text in a string, using a regular expression or search string.
      * @param searchValue A string to search for.
      * @param replacer A function that returns the replacement text.
      */
    replace(searchValue: string | RegExp, replacer: (substring: string, ...args: any[]) => string): string;

    /**
      * Finds the first substring match in a regular expression search.
      * @param regexp The regular expression pattern and applicable flags.
      */
    search(regexp: string | RegExp): number;

    /**
      * Returns a section of a string.
      * @param start The index to the beginning of the specified portion of stringObj.
      * @param end The index to the end of the specified portion of stringObj. The substring includes the characters up to, but not including, the character indicated by end.
      * If this value is not specified, the substring continues to the end of stringObj.
      */
    slice(start?: number, end?: number): string;

    /**
      * Split a string into substrings using the specified separator and return them as an array.
      * @param separator A string that identifies character or characters to use in separating the string. If omitted, a single-element array containing the entire string is returned.
      * @param limit A value used to limit the number of elements returned in the array.
      */
    split(separator: string | RegExp, limit?: number): string[];

    /**
      * Returns the substring at the specified location within a String object.
      * @param start The zero-based index number indicating the beginning of the substring.
      * @param end Zero-based index number indicating the end of the substring. The substring includes the characters up to, but not including, the character indicated by end.
      * If end is omitted, the characters from start through the end of the original string are returned.
      */
    substring(start: number, end?: number): string;

    /** Converts all the alphabetic characters in a string to lowercase. */
    toLowerCase(): string;

    /** Converts all alphabetic characters to lowercase, taking into account the host environment's current locale. */
    toLocaleLowerCase(): string;

    /** Converts all the alphabetic characters in a string to uppercase. */
    toUpperCase(): string;

    /** Returns a string where all alphabetic characters have been converted to uppercase, taking into account the host environment's current locale. */
    toLocaleUpperCase(): string;

    /** Removes the leading and trailing white space and line terminator characters from a string. */
    trim(): string;

    /** Returns the length of a String object. */
    readonly length: number;

    // IE extensions
    /**
      * Gets a substring beginning at the specified location and having the specified length.
      * @param from The starting position of the desired substring. The index of the first character in the string is zero.
      * @param length The number of characters to include in the returned substring.
      */
    substr(from: number, length?: number): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): string;

    readonly [index: number]: string;
}

interface StringConstructor {
    new(value?: any): String;
    (value?: any): string;
    readonly prototype: String;
    fromCharCode(...codes: number[]): string;
}

/**
  * Allows manipulation and formatting of text strings and determination and location of substrings within strings.
  */
declare const String: StringConstructor;

interface Boolean {
    /** Returns the primitive value of the specified object. */
    valueOf(): boolean;
}

interface BooleanConstructor {
    new(value?: any): Boolean;
    (value?: any): boolean;
    readonly prototype: Boolean;
}

declare const Boolean: BooleanConstructor;

interface Number {
    /**
      * Returns a string representation of an object.
      * @param radix Specifies a radix for converting numeric values to strings. This value is only used for numbers.
      */
    toString(radix?: number): string;

    /**
      * Returns a string representing a number in fixed-point notation.
      * @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
      */
    toFixed(fractionDigits?: number): string;

    /**
      * Returns a string containing a number represented in exponential notation.
      * @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
      */
    toExponential(fractionDigits?: number): string;

    /**
      * Returns a string containing a number represented either in exponential or fixed-point notation with a specified number of digits.
      * @param precision Number of significant digits. Must be in the range 1 - 21, inclusive.
      */
    toPrecision(precision?: number): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): number;
}

interface NumberConstructor {
    new(value?: any): Number;
    (value?: any): number;
    readonly prototype: Number;

    /** The largest number that can be represented in JavaScript. Equal to approximately 1.79E+308. */
    readonly MAX_VALUE: number;

    /** The closest number to zero that can be represented in JavaScript. Equal to approximately 5.00E-324. */
    readonly MIN_VALUE: number;

    /**
      * A value that is not a number.
      * In equality comparisons, NaN does not equal any value, including itself. To test whether a value is equivalent to NaN, use the isNaN function.
      */
    readonly NaN: number;

    /**
      * A value that is less than the largest negative number that can be represented in JavaScript.
      * JavaScript displays NEGATIVE_INFINITY values as -infinity.
      */
    readonly NEGATIVE_INFINITY: number;

    /**
      * A value greater than the largest number that can be represented in JavaScript.
      * JavaScript displays POSITIVE_INFINITY values as infinity.
      */
    readonly POSITIVE_INFINITY: number;
}

/** An object that represents a number of any kind. All JavaScript numbers are 64-bit floating-point numbers. */
declare const Number: NumberConstructor;

interface TemplateStringsArray extends ReadonlyArray<string> {
    readonly raw: ReadonlyArray<string>;
}

interface Math {
    /** The mathematical constant e. This is Euler's number, the base of natural logarithms. */
    readonly E: number;
    /** The natural logarithm of 10. */
    readonly LN10: number;
    /** The natural logarithm of 2. */
    readonly LN2: number;
    /** The base-2 logarithm of e. */
    readonly LOG2E: number;
    /** The base-10 logarithm of e. */
    readonly LOG10E: number;
    /** Pi. This is the ratio of the circumference of a circle to its diameter. */
    readonly PI: number;
    /** The square root of 0.5, or, equivalently, one divided by the square root of 2. */
    readonly SQRT1_2: number;
    /** The square root of 2. */
    readonly SQRT2: number;
    /**
      * Returns the absolute value of a number (the value without regard to whether it is positive or negative).
      * For example, the absolute value of -5 is the same as the absolute value of 5.
      * @param x A numeric expression for which the absolute value is needed.
      */
    abs(x: number): number;
    /**
      * Returns the arc cosine (or inverse cosine) of a number.
      * @param x A numeric expression.
      */
    acos(x: number): number;
    /**
      * Returns the arcsine of a number.
      * @param x A numeric expression.
      */
    asin(x: number): number;
    /**
      * Returns the arctangent of a number.
      * @param x A numeric expression for which the arctangent is needed.
      */
    atan(x: number): number;
    /**
      * Returns the angle (in radians) from the X axis to a point.
      * @param y A numeric expression representing the cartesian y-coordinate.
      * @param x A numeric expression representing the cartesian x-coordinate.
      */
    atan2(y: number, x: number): number;
    /**
      * Returns the smallest number greater than or equal to its numeric argument.
      * @param x A numeric expression.
      */
    ceil(x: number): number;
    /**
      * Returns the cosine of a number.
      * @param x A numeric expression that contains an angle measured in radians.
      */
    cos(x: number): number;
    /**
      * Returns e (the base of natural logarithms) raised to a power.
      * @param x A numeric expression representing the power of e.
      */
    exp(x: number): number;
    /**
      * Returns the greatest number less than or equal to its numeric argument.
      * @param x A numeric expression.
      */
    floor(x: number): number;
    /**
      * Returns the natural logarithm (base e) of a number.
      * @param x A numeric expression.
      */
    log(x: number): number;
    /**
      * Returns the larger of a set of supplied numeric expressions.
      * @param values Numeric expressions to be evaluated.
      */
    max(...values: number[]): number;
    /**
      * Returns the smaller of a set of supplied numeric expressions.
      * @param values Numeric expressions to be evaluated.
      */
    min(...values: number[]): number;
    /**
      * Returns the value of a base expression taken to a specified power.
      * @param x The base value of the expression.
      * @param y The exponent value of the expression.
      */
    pow(x: number, y: number): number;
    /** Returns a pseudorandom number between 0 and 1. */
    random(): number;
    /**
      * Returns a supplied numeric expression rounded to the nearest number.
      * @param x The value to be rounded to the nearest number.
      */
    round(x: number): number;
    /**
      * Returns the sine of a number.
      * @param x A numeric expression that contains an angle measured in radians.
      */
    sin(x: number): number;
    /**
      * Returns the square root of a number.
      * @param x A numeric expression.
      */
    sqrt(x: number): number;
    /**
      * Returns the tangent of a number.
      * @param x A numeric expression that contains an angle measured in radians.
      */
    tan(x: number): number;
}
/** An intrinsic object that provides basic mathematics functionality and constants. */
declare const Math: Math;

interface Color {
    /** The mathematical constant e. This is Euler's number, the base of natural logarithms. */
    readonly getRed();
    /** Returns the red component. */
    readonly getGreen();
    /** Returns the green component. */
    readonly getBlue();
    /** Returns the blue component. */
    readonly getAlpha();
    /** Returns the alpha component. */
    readonly toString();
    /** Converts the color to a string (e.g. [0.25, 0.25, 0.75, 1]).*/
    
    Color(red: number, green: number, blue: number, alpha: number);
    /**
      * Initializes a new color as opaque (i.e. alpha equal to 1). All arguments are clamped to the range [0; 1].
      */
    Color(red: number, green: number, blue: number);
    /**
      * Initializes a new color as opaque (i.e. alpha equal to 1). All arguments are clamped to the range [0; 1].
      */
    Color();
    /** Initializes a new color as opaque white. */
}
/** An intrinsic object that provides basic mathematics functionality and constants. */
declare const Color: Color;

interface Record {
  
}

interface Shaft {
  /** Returns the diameter of the specified section. The section is a value in the range [0; getNumberOfSections()[.*/ 
  getDiameter(index: Integer): number;  
  /** Returns the length of the specified section. The section is a value in the range [0; getNumberOfSections()[. */
  getLength(index: Integer): number;
  /** Returns the maximum diameter of the shaft. */
  getMaximumDiameter(): number;
  /** Returns the number of sections. */
  getNumberOfSections(): Integer;
  /** Returns the length of the shaft. */
  getTotalLength(): number; 
  /** Returns true if the shaft has any sections. */
  hasSections(): boolean;  
}

interface Holder {
  /** Returns the diameter of the specified section. The section is a value in the range [0; getNumberOfSections()[.*/ 
  getDiameter(index: Integer): number;  
  /** Returns the length of the specified section. The section is a value in the range [0; getNumberOfSections()[. */
  getLength(index: Integer): number;
  /** Returns the maximum diameter of the holder. */
  getMaximumDiameter(): number;
  /** Returns the number of sections. */
  getNumberOfSections(): Integer;
  /** Returns the length of the holder. */
  getTotalLength(): number; 
  /** Returns true if the holder has any sections. */
  hasSections(): boolean;  
}

interface Tool {
  /** The tool number. */
  readonly number: number;
  /** The turret. */
  turret: Integer;
  /**  The diameter offset (used for milling). */
  diameterOffset: Integer;
  /** The length offset (used for milling). */
  lengthOffset: Integer; 
  /** The compensation offset (used for turning). */
  compensationOffset: Integer;
  /** True if tool must be manually changed. */
  manualToolChange: boolean;
  /** True if break control is enabled. */
  breakControl: boolean;
  /** True if the tool is live - otherwise it is static. */
  liveTool: boolean;
  /** Number identifying the holder. */
  holderNumber: Integer; 
  /** The spindle mode. */
  spindleMode: Integer; 
  /** The spindle speed in RPM. Positive for clockwise direction. */
  spindleRPM: number;
  /** The spindle speed in RPM for ramping. Positive for clockwise direction. */
  rampingSpindleRPM: number; 
  /** The surface speed (CSS). */
  surfaceSpeed: number; 
  /** The maximum spindle speed (RPM) when using surface speed (CSS). */
  maximumSpindleSpeed: number;
  /** The number of flutes. */
  numberOfFlutes: Integer;
  /** The number of thread per unit of length. */
  threadPitch: number;
  /** The coolant. */
  coolant: Integer;
  /** The material. */
  material: Integer;
  /** Comment. */
  comment: String;
  /** The vendor. */
  vendor: String; 
  /** The product id. */
  productId: String; 
  /** The unit. */
  unit: Integer;
  /** The tool type. */
  type: Integer;
  /** The diameter. */
  diameter: number; 
  /** The corner radius. */
  cornerRadius: number;
  /** The taper angle. */
  taperAngle: number;
  /** The flute length. */
  fluteLength: number; 
  /** The shoulder length. */
  shoulderLength: number;
  /** The shaft diameter. */
  shaftDiameter: number;
  /** The body length. */
  bodyLength: number;
  /** The tool shaft. */
  shaft: Shaft;
  /** The holder tip diameter. */
  holderTipDiameter: number;
  /** The holder diameter. */
  holderDiameter: number;
  /** The holder length. */
  holderLength: number;
  /** The tool holder. */
  holder: Holder; 
  /** The boring bar orientation in radians. */
  boringBarOrientation: number;
  /** The inscribed circle diameter for turning tool.*/ 
  inscribedCircleDiameter: number;
  /** The edge length for turning tool. */
  edgeLength: number;
  /** The nose radius for turning tools. */
  noseRadius: number;
  /** The relief angle in degrees. */
  reliefAngle:  number; 
  /** The turning tool thickness;. */
  thickness:  number;
  /** The groove tool width. */
  grooveWidth:  number;
  /** The cross section type for turning tools. */
  crossSection: String;
  /** The tolerance for turning tools. */
  tolerance:  String;
  /** The thread pitch for turning tools. */
  pitch:  number;
  /** The holder hand. Left, Right, or Neutral. */
  hand: String; 
  /** Clamping for turning tools.  */
  clamping: String;
}

interface Matrix {
  readonly Matrix();
  readonly Matrix(scale: Number);
  readonly Matrix(right: Vector, up: Vector, forward: Vector);
  readonly Matrix(m: Number);
  readonly Matrix(axis: Vector, angle: Number);
  readonly rotateX(angle: Number);
  readonly rotateY(angle: Number);
  readonly rotateZ(angle: Number);
  readonly getElement(row: Integer, column: Integer): Number ;
  readonly setElement(row: Integer, column: Integer, value: Number);
  readonly getRow(row: Integer): Vector ;
  readonly setRow(row: Integer, value: Vector);
  readonly getColumn(column: Integer): Vector ;
  readonly setColumn(column: Integer, value: Vector);
  readonly getForward(): Vector ;
  readonly setForward(value: Vector);
  readonly getUp(): Vector ;
  readonly setUp(value: Vector);
  readonly getRight(): Vector ;
  readonly setRight(value: Vector);
  readonly getTiltAndTilt(primary: Integer, secondary: Integer): Vector ;
  readonly getTurnAndTilt(primary: Integer, secondary: Integer): Vector ;
  readonly getEuler(convention: Integer): Vector ;
  readonly getEuler2(convention: Integer): Vector ;
  readonly getEulerZXZ(): Vector ;
  readonly getEulerZYZ(): Vector ;
  readonly getEulerXYZ(): Vector ;
  readonly getEulerZYX(): Vector ;
  readonly clamp(epsilon: Number);
  readonly isZero(): Boolean ;
  readonly isIdentity(): Boolean ;
  readonly getN1(): Number ;
  readonly getN2(): Number ;
  readonly normalize();
  readonly add(right: Matrix);
  readonly subtract(right: Matrix);
  readonly negate();
  readonly getNegated(): Matrix ;
  readonly transpose();
  readonly getTransposed(): Matrix ;
  readonly multiply(right: Number): Matrix ;
  readonly multiply(right: Matrix): Matrix ;
  readonly multiply(right: Vector): Vector ;
  readonly toString(): String ;
}

interface Vector {
  /** The X coordinate */
  x: number;
  /** The Y coordinate */
  y: number;
  /** The Z coordinate */
  z: number;
  /** The length of the vector */
  length: number;
  /** The square of the length of the vector */
  length2: number;
  /** The negated vector */
  negated: Vector;
  /** The vector with absolute coordinates */
  abs: Vector;
  /** The vector normalized to length 1. */
  normalized: Vector;
  getX(): number;
  setX(x: number);
  getY(): number;
  setY(y: number);
  getZ(): number;
  setZ(z: number);
  getCoordinate(coordinate: Integer): number;
  setCoordinate(coordinate: Integer, value: number);
  add(value: Vector);
  add(x: number, y: number, z: number);
  subtract(value: Vector);
  subtract(x: number, y: number, z: number);
  multiply(value: number);
  divide(value: number);
  isNonZero(): boolean;
  isZero(): boolean;
  getXYAngle(): number;
  getZAngle(): number;
  getLength2(): number;
  getLength(): number;
  normalize();
  getNormalized(): Vector;
  negate();
  getNegated(): Vector;
  getAbsolute(): Vector;
  getMinimum(): number;
  getMaximum(): number;
  toString(): String;
  toDeg(): Vector;
  toRad(): Vector;
}

interface Integer {

}

interface Range {
  
}

interface BoundingBox {
  /** The lower corner. */
  lower: Vector;
  /** The upper corner */
  upper: Vector;
}

interface Value {
  
}

interface Axis {
  readonly Axis();
  readonly Axis(_table: Boolean, _axis: Vector, _offset: Vector, _coordinate: Integer);
  readonly Axis(_table: Boolean, _axis: Vector, _offset: Vector, _coordinate: Integer, _range: Range);
  readonly getName(): String ;
  readonly setName(name: String);
  readonly getActuator(): Integer ;
  readonly setActuator(actuator: Integer);
  readonly isLinear(): Boolean ;
  readonly isRotational(): Boolean ;
  readonly isAggregate(): Boolean ;
  readonly getResolution(): Number ;
  readonly setResolution(resolution: Number);
  readonly clampToResolution(_value: Number): Number ;
  readonly getResolutionError(_value: Number): Number ;
  readonly getMaximumFeed(): Number ;
  readonly setMaximumFeed(_maximumFeed: Number);
  readonly getPreference(): Integer ;
  readonly setPreference(preference: Integer);
  readonly isEnabled(): Boolean ;
  readonly isHead(): Boolean ;
  readonly isTable(): Boolean ;
  readonly getEffectiveAxis(): Vector ;
  readonly getAxis(): Vector ;
  readonly getOffset(): Vector ;
  readonly getDisplacement(): Number ;
  readonly isCyclic(): Boolean ;
  readonly getRange(): Range ;
  readonly getCoordinate(): Integer ;
  readonly isSupported(value: Number): Boolean ;
  readonly clamp(value: Number): Number ;
  readonly reduce(value: Number): Number ;
  readonly remapToRange(angle: Number): Number ;
  readonly remapToRange2(angle: Number, current: Number): Number ;
  readonly getAxisRotation(position: Number): Matrix ;
}

interface Base64 {
readonly btoa(text: String): String ;
readonly atob(text: String): String ;

}

interface BinaryFile {
  readonly loadBinary(path: String): String ;
  readonly saveBinary(path: String, data: String) ;
}

interface Array {
  readonly indexOf(): Integer ;
  readonly lastIndexOf(): Integer ;
}

interface Canvas {
  readonly getWidth(): Integer ;
  readonly getHeight(): Integer ;
  readonly clear(rgba: Integer);
  readonly getColor(x: Integer, y: Integer): Color ;
  readonly setColor(x: Integer, y: Integer, color: Color);
  readonly getPixel(x: Integer, y: Integer): Integer ;
  readonly setPixel(x: Integer, y: Integer, rgba: Integer);
  readonly saveImage(path: String, mimetype: String);
}

interface CircularMotion {
  readonly getPositionU(u: Number): Vector ;
  readonly getOffset(): Number ;
}

interface Curve {
  readonly getNumberOfEntities(): Integer ;
  readonly getEntity(index: Integer): CurveEntity ;
  readonly isClosed(): Boolean ;
  readonly hasArcs(): Boolean ;
  readonly getLength(): Number ;
  readonly getExtent(): BoundingBox ;
  readonly getLinearize(tolerance: Number): Curve ;
}

interface CurveEntity {
  readonly CurveEntity();
  readonly getLength(): Number ;
  readonly getRadius(): Number ;
  readonly isBigArc(): Boolean ;
  readonly getSweep(): Number ;
  readonly reverse();
  readonly translate(offset: Vector);
}

interface FileSystem {
  readonly getCombinedPath(rootPath: String, relativePath: String): String ;
  readonly getFolderPath(path: String): String ;
  readonly getFilename(path: String): String ;
  readonly replaceExtension(path: String, extension: String): String ;
  readonly makeFolder(path: String);
  readonly isFolder(path: String): Boolean ;
  readonly isFile(path: String): Boolean ;
  readonly copyFile(src: String, dest: String) ;
  readonly moveFile(src: String, dest: String) ;
  readonly remove(path: String) ;
  readonly removeFolder(path: String) ;
  readonly removeFolderRecursive(path: String) ;
  readonly getFileSize(path: String): Integer ;
  readonly getTemporaryFolder(): String ;
  readonly getTemporaryFile(prefix: String): String ;
}

interface Format {
  readonly Format(specifiers: Map);
  readonly format(value: Number): String ;
  readonly getResultingValue(value: Number): Number ;
  readonly getError(value: Number): Number ;
  readonly isSignificant(value: Number): Boolean ;
  readonly areDifferent(a: Number, b: Number): Boolean ;
  readonly getMinimumValue(): Number ;
}

interface FormatNumber {
  readonly FormatNumber();
  readonly getDecimalSymbol(): Integer ;
  readonly setDecimalSymbol(decimalSymbol: Integer);
  readonly getZeroPad(): Boolean ;
  readonly setZeroPad(zeroPad: Boolean);
  readonly getForceSign(): Boolean ;
  readonly setForceSign(forceSign: Boolean);
  readonly getForceDecimal(): Boolean ;
  readonly setForceDecimal(forceDecimal: Boolean);
  readonly getWidth(): Integer ;
  readonly setWidth(width: Integer);
  readonly getNumberOfDecimals(): Integer ;
  readonly setNumberOfDecimals(numberOfDecimals: Integer);
  readonly getTrimZeroDecimals(): Boolean ;
  readonly setTrimZeroDecimals(trimZeroDecimals: Boolean);
  readonly getTrimLeadZero(): Boolean ;
  readonly setTrimLeadZero(trimLeadZero: Boolean);
  readonly remap(value: Number): Number ;
  readonly getCyclicLimit(): Number ;
  readonly getCyclicSign(): Integer ;
  readonly setCyclicMapping(limit: Number, sign: Integer);
  readonly getScale(): Number ;
  readonly setScale(scale: Number);
  readonly getOffset(): Number ;
  readonly setOffset(offset: Number);
  readonly getPrefix(): String ;
  readonly setPrefix(prefix: String);
  readonly getSuffix(): String ;
  readonly setSuffix(suffix: String);
  readonly format(value: Number): String ;
  readonly isSignificant(value: Number): Boolean ;
  readonly areDifferent(a: Number, b: Number): Boolean ;
  readonly getMinimumValue(): Number ;
  readonly getResultingValue(value: Number): Number ;
  readonly getError(value: Number): Number ;
}

interface FormData {
  readonly FormData();
  readonly append(name: String, value: String, filename: String);
  readonly has(name: String): Boolean ;
  readonly get(name: String): String ;
}

interface Holder {
  readonly hasSections(): Boolean ;
  readonly getNumberOfSections(): Integer ;
  readonly getMaximumDiameter(): Number ;
  readonly getTotalLength(): Number ;
  readonly getDiameter(index: Integer): Number ;
  readonly getLength(index: Integer): Number ;
}

interface IncrementalVariable {
  readonly IncrementalVariable(specifiers: Map, format: Format);
  readonly format(value: Number): String ;
  readonly getPrefix(): Value ;
  readonly setPrefix(prefix: Value);
  readonly disable();
  readonly reset();
  readonly getCurrent(): Value ;
}

interface MachineConfiguration {
  readonly getXML(): String ;
  readonly MachineConfiguration();
  readonly MachineConfiguration(u: Axis);
  readonly MachineConfiguration(u: Axis, v: Axis);
  readonly MachineConfiguration(u: Axis, v: Axis, w: Axis);
  readonly getMilling(): Boolean ;
  readonly setMilling(milling: Boolean);
  readonly getTurning(): Boolean ;
  readonly setTurning(turning: Boolean);
  readonly getWire(): Boolean ;
  readonly setWire(wire: Boolean);
  readonly getJet(): Boolean ;
  readonly setJet(jet: Boolean);
  readonly getToolChanger(): Boolean ;
  readonly setToolChanger(toolChanger: Boolean);
  readonly getToolPreload(): Boolean ;
  readonly setToolPreload(toolPreload: Boolean);
  readonly getNumberOfTools(): Integer ;
  readonly setNumberOfTools(numberOfTools: Integer);
  readonly getMaximumToolLength(): Number ;
  readonly setMaximumToolLength(maximumToolLength: Number);
  readonly getMaximumToolDiameter(): Number ;
  readonly setMaximumToolDiameter(maximumToolDiameter: Number);
  readonly getMaximumToolWeight(): Number ;
  readonly setMaximumToolWeight(maximumToolWeight: Number);
  readonly getMaximumFeedrate(): Number ;
  readonly setMaximumFeedrate(maximumFeedrate: Number);
  readonly getMaximumCuttingFeedrate(): Number ;
  readonly setMaximumCuttingFeedrate(maximumCuttingFeedrate: Number);
  readonly getMaximumBlockProcessingSpeed(): Integer ;
  readonly setMaximumBlockProcessingSpeed(maximumBlockProcessingSpeed: Integer);
  readonly getNumberOfWorkOffsets(): Integer ;
  readonly setNumberOfWorkOffsets(numberOfWorkOffsets: Integer);
  readonly getFeedrateRatio(): Number ;
  readonly setFeedrateRatio(feedrateRatio: Number);
  readonly getToolChangeTime(): Number ;
  readonly setToolChangeTime(toolChangeTime: Number);
  readonly getDimensions(): Vector ;
  readonly setDimensions(dimensions: Vector);
  readonly getWidth(): Number ;
  readonly setWidth(width: Number);
  readonly getDepth(): Number ;
  readonly setDepth(depth: Number);
  readonly getHeight(): Number ;
  readonly setHeight(height: Number);
  readonly getWeight(): Number ;
  readonly setWeight(weight: Number);
  readonly getPartDimensions(): Vector ;
  readonly setPartDimensions(partDimensions: Vector);
  readonly getPartMaximumX(): Number ;
  readonly setPartMaximumX(width: Number);
  readonly getPartMaximumY(): Number ;
  readonly setPartMaximumY(depth: Number);
  readonly getPartMaximumZ(): Number ;
  readonly setPartMaximumZ(height: Number);
  readonly getWeightCapacity(): Number ;
  readonly setWeightCapacity(weightCapacity: Number);
  readonly getSpindleAxis(): Vector ;
  readonly setSpindleAxis(spindleAxis: Vector);
  readonly getSpindleDescription(): String ;
  readonly setSpindleDescription(spindleDescription: String);
  readonly getMaximumSpindlePower(): Number ;
  readonly setMaximumSpindlePower(maximumSpindlePower: Number);
  readonly getMaximumSpindleSpeed(): Number ;
  readonly setMaximumSpindleSpeed(maximumSpindleSpeed: Number);
  readonly getCollectChuck(): String ;
  readonly setCollectChuck(collectChuck: String);
  readonly getAxisByName(name: String): Axis ;
  readonly getAxisX(): Axis ;
  readonly getAxisY(): Axis ;
  readonly getAxisZ(): Axis ;
  readonly isSupportedPosition(position: Vector): Boolean ;
  readonly getValidityStatus(): Integer ;
  readonly isSupported(): Boolean ;
  readonly setSingularity(adjust: Boolean, method: Integer, cone: Number, angle: Number, tolerance: Number, linearizationTolerance: Number);
  readonly getSingularityAdjust(): Boolean ;
  readonly getSingularityMethod(): Integer ;
  readonly getSingularityCone(): Number ;
  readonly getSingularityAngle(): Number ;
  readonly getSingularityTolerance(): Number ;
  readonly getSingularityLinearizationTolerance(): Number ;
  readonly isMachineAxisRotation(abc: Vector): Boolean ;
  readonly is3DConfiguration(): Boolean ;
  readonly isMultiAxisConfiguration(): Boolean ;
  readonly getNumberOfAxes(): Integer ;
  readonly isHeadConfiguration(): Boolean ;
  readonly isTableConfiguration(): Boolean ;
  readonly getAxisU(): Axis ;
  readonly getAxisV(): Axis ;
  readonly getAxisW(): Axis ;
  readonly isMachineCoordinate(coordinate: Integer): Boolean ;
  readonly getAxisByCoordinate(coordinate: Integer): Axis ;
  readonly clamp(_abc: Vector): Vector ;
  readonly isXYZSupported(_xyz: Vector): Boolean ;
  readonly isABCSupported(_abc: Vector): Boolean ;
  readonly isDirectionSupported(direction: Vector): Boolean ;
  readonly getABC(orientation: Matrix): Vector ;
  readonly getABCByDirectionBoth(direction: Vector): VectorPair ;
  readonly getABCByDirection(direction: Vector): Vector ;
  readonly getABCByDirection2(direction: Vector): Vector ;
  readonly getOtherABCByDirection(abc: Vector): Vector ;
  readonly getPreferredABC(abc: Vector): Vector ;
  readonly remapABC(abc: Vector): Vector ;
  readonly remapToABC(abc: Vector, current: Vector): Vector ;
  readonly getCoordinates(): Integer ;
  readonly getPosition(p: Vector, abc: Vector): Vector ;
  readonly getDirection(abc: Vector): Vector ;
  readonly getHeadABC(abc: Vector): Vector ;
  readonly getTableABC(abc: Vector): Vector ;
  readonly getHeadOrientation(abc: Vector): Matrix ;
  readonly getTableOrientation(abc: Vector): Matrix ;
  readonly getOrientation(abc: Vector): Matrix ;
  readonly getSpindleAxisABC(abc: Vector): Vector ;
  readonly getRemainingOrientation(abc: Vector, desired: Matrix): Matrix ;
  readonly getRetractPlane(): Number ;
  readonly setRetractPlane(retractPlane: Number);
  readonly hasHomePositionX(): Boolean ;
  readonly getHomePositionX(): Number ;
  readonly setHomePositionX(x: Number);
  readonly hasHomePositionY(): Boolean ;
  readonly getHomePositionY(): Number ;
  readonly setHomePositionY(y: Number);
  readonly getModel(): String ;
  readonly setModel(model: String);
  readonly getDescription(): String ;
  readonly setDescription(description: String);
  readonly getVendor(): String ;
  readonly setVendor(vendor: String);
  readonly getVendorUrl(): String ;
  readonly setVendorUrl(vendorUrl: String);
  readonly getControl(): String ;
  readonly setControl(control: String);
  readonly isCoolantSupported(coolant: Integer): Boolean ;
  readonly setCoolantSupported(coolant: Integer, available: Boolean);
  readonly getRetractOnIndexing(): Boolean ;
  readonly setRetractOnIndexing(retractOnIndexing: Boolean);
  readonly getShortestAngularRotation(): Boolean ;
  readonly setShortestAngularRotation(shortestAngularRotation: Boolean);
}

interface MachineParameters {
  readonly spindleOrientation: Number ;
  readonly chipBreakingDistance: Number ;
  readonly drillingSafeDistance: Number ;
}

interface Mail {
  readonly Mail();
  readonly addRecipient(email: String);
  readonly addRecipient2(email: String, name: String);
  readonly addCCRecipient(email: String);
  readonly addCCRecipient2(email: String, name: String);
  readonly addBCCRecipient(email: String);
  readonly addBCCRecipient2(email: String, name: String);
  readonly getBody(): String ;
  readonly setBody(body: String);
  readonly getSubject(): String ;
  readonly setSubject(subject: String);
  readonly getSenderName(): String ;
  readonly setSenderName(senderName: String);
  readonly getSenderEmail(): String ;
  readonly setSenderEmail(senderEmail: String);
  readonly getReplyTo(): String ;
  readonly setReplyTo(replyTo: String);
}

interface Modal {
  readonly Modal(specifiers: Map, format: Format);
  readonly format(value: Value): String ;
  readonly getPrefix(): Value ;
  readonly setPrefix(prefix: Value);
  readonly getSuffix(): Value ;
  readonly setSuffix(suffix: Value);
  readonly reset();
  readonly getCurrent(): Value ;
}

interface ModalGroup {
  readonly ModalGroup();
  readonly setStrict(strict: Boolean);
  readonly setAutoReset(autoreset: Boolean);
  readonly setLogUndefined(logundefined: Boolean);
  readonly getNumberOfGroups(): Integer ;
  readonly getNumberOfCodes(): Integer ;
  readonly getNumberOfCodesInGroup(group: Integer): Integer ;
  readonly isCodeDefined(code: Integer): Boolean ;
  readonly isActiveCode(code: Integer): Boolean ;
  readonly makeActiveCode(code: Integer);
  readonly getActiveCode(group: Integer): Integer ;
  readonly hasActiveCode(group: Integer): Boolean ;
  readonly reset();
  readonly resetGroup(group: Integer): Integer ;
  readonly createGroup(): Integer ;
  readonly removeCode(code: Integer);
  readonly addCode(group: Integer, code: Integer);
  readonly isGroup(group: Integer): Boolean ;
  readonly getGroup(code: Integer): Integer ;
  readonly inSameGroup(a: Integer, b: Integer): Boolean ;
  readonly isEnabled(): Boolean ;
  readonly enable();
  readonly disable();
  readonly setForce(force: Boolean);
  readonly setFormatNumber(formatNumber: FormatNumber);
  readonly setPrefix(prefix: String);
  readonly setSuffix(suffix: String);
  readonly format(code: Integer): String ;
}
  declare function getMachineConfiguration(): MachineConfiguration ;
  declare function setMachineConfiguration(machine: MachineConfiguration);
  declare function optimizeMachineAngles();
  declare function optimizeMachineAngles2(tcp: Integer);
  declare function optimizeMachineAnglesByMachine(machine: MachineConfiguration, tcp: Integer);
  declare function isSectionSpecialCycle(uri: String): Boolean ;
  declare function setSectionSpecialCycle(uri: String, specialCycle: Boolean);
  declare function getProduct(): String ;
  declare function getProductUri(): String ;
  declare function getProductUrl(): String ;
  declare function getVendor(): String ;
  declare function getVendorUrl(): String ;
  declare function getVersion(): String ;
  declare function openUrl(url: String);
  declare function printDocument(path: String): Boolean ;
  declare function printDocumentTo(path: String, printerName: String): Boolean ;
  declare function createToolRenderer(): ToolRenderer ;
  declare function setExitCode(code: Integer);
  declare function error(message: String);
  declare function warning(message: String);
  declare function warningOnce(message: String, id: Integer);
  declare function log(message: String);
  declare function getCurrentNCLocation(): String ;
  declare function getSystemUnit(): Integer ;
  declare function getPlatform(): String ;
  declare function hasSymbol(symbol: Integer): Boolean ;
  declare function isTextSupported(text: String): Boolean ;
  declare function getCodePage(): Integer ;
  declare function setCodePage(name: String);
  declare function write(message: String);
  declare function writeln(message: String);
  declare function getWordSeparator(): String ;
  declare function setWordSeparator(message: String);
  declare function formatWords(message: String): String ;
  declare function getLangId(): String ;
  declare function isSupportedText(message: String): Boolean ;
  declare function localize(message: String): String ;
  declare function localize2(section: String, message: String): String ;
  declare function loadLocale(langId: String): Boolean ;
  declare function include(path: String);
  declare function findFile(path: String): String ;
  declare function getHeader(): String ;
  declare function getHeaderVersion(): String ;
  declare function getHeaderCommit(): String ;
  declare function getHeaderDate(): String ;
  declare function getHeaderDate2(): Date ;
  declare function getHeaderSnippet(keyword: String): String ;
  declare function getIntermediatePath(): String ;
  declare function getOutputPath(): String ;
  declare function getConfigurationFolder(): String ;
  declare function getConfigurationPath(): String ;
  declare function getPostProcessorFolder(): String ;
  declare function getPostProcessorPath(): String ;
  declare function getCascadingPath(): String ;
  declare function getSecurityLevel(): Integer ;
  declare function exportNCAs(path: String, format: String);
  declare function execute(path: String, arguments: String, hide: Boolean, workingFolder: String): Integer ;
  declare function executeNoWait(path: String, arguments: String, hide: Boolean, workingFolder: String);
  declare function setEOL(eol: String);
  declare function isRedirecting(): Boolean ;
  declare function closeRedirection();
  declare function redirectToFile(path: String);
  declare function redirectToBuffer();
  declare function getRedirectionBuffer(): String ;
  declare function getRedirectionBuffer2(clear: Boolean): String ;
  declare function registerPostProcessing(path: String);
  declare function getWorkpiece(): BoundingBox ;
  declare function getFixture(): BoundingBox ;
  declare function getMachineConfigurations(): String ;
  declare function getMachineConfigurationByName(name: String): MachineConfiguration ;
  declare function loadMachineConfiguration(path: String): MachineConfiguration ;
  declare function isInteractionAllowed(): Boolean ;
  declare function alert(title: String, description: String);
  declare function promptKey(title: String, description: String): String ;
  declare function promptKey2(title: String, description: String, accept: String): String ;
  declare function promptKey3(title: String, description: String, accept: String, keys: String): String ;
  declare function promptText(title: String, description: String): String ;
  declare function getAsInt(text: String): Integer ;
  declare function getAsFloat(text: String): Number ;
  declare function isSafeText(text: String, permitted: String): Boolean ;
  declare function filterText(text: String, keep: String): String ;
  declare function translateText(text: String, src: String, dest: String): String ;
  declare function loadText(url: String, encoding: String): String ;
  declare function getOutputUnit(): Integer ;
  declare function setOutputUnit(unit: Integer);
  declare function getDogLeg(): Boolean ;
  declare function setDogLeg(dogLeg: Boolean);
  declare function getRotation(): Matrix ;
  declare function setRotation(rotation: Matrix);
  declare function getTranslation(): Vector ;
  declare function cancelTransformation();
  declare function setTranslation(translation: Vector);
  declare function getFramePosition(position: Vector): Vector ;
  declare function getFrameDirection(direction: Vector): Vector ;
  declare function getSectionFramePosition(framePosition: Vector): Vector ;
  declare function getSectionFrameDirection(frameDirection: Vector): Vector ;
  declare function getHighFeedMapping(): Integer ;
  declare function setHighFeedMapping(mode: Integer);
  declare function getHighFeedrate(): Number ;
  declare function setHighFeedrate(feedrate: Number);
  declare function getGlobalPosition(p: Vector): Vector ;
  declare function getWCSPosition(p: Vector): Vector ;
  declare function getSectionPosition(p: Vector): Vector ;
  declare function getCurrentGlobalPosition(): Vector ;
  declare function getCurrentPosition(): Vector ;
  declare function setCurrentPosition(currentPosition: Vector);
  declare function setCurrentPositionX(x: Number);
  declare function setCurrentPositionY(y: Number);
  declare function setCurrentPositionZ(z: Number);
  declare function getCurrentDirection(): Vector ;
  declare function setCurrentDirection(currentDirection: Vector);
  declare function skipRemainingSection();
  declare function isClockwiseSpindleDirection(): Boolean ;
  declare function isSpindleActive(): Boolean ;
  declare function isCoolantActive(): Boolean ;
  declare function isSpeedFeedSynchronizationActive(): Boolean ;
  declare function is3D(): Boolean ;
  declare function isMultiAxis(): Boolean ;
  declare function isMultiChannelProgram(): Boolean ;
  declare function getNumberOfChannels(): Integer ;
  declare function getNumberOfRecords(): Integer ;
  declare function getRecord(id: Integer): Record ;
  declare function getCurrentSectionId(): Integer ;
  declare function getNumberOfSections(): Integer ;
  declare function getSection(index: Integer): Section ;
  declare function getPreviousSection(): Section ;
  declare function hasNextSection(): Boolean ;
  declare function getNextSection(): Section ;
  declare function getToolTable(): ToolTable ;
  declare function getCurrentRecordId(): Integer ;
  declare function getMachiningDistance(tool: Integer): Number ;
  declare function isExpanding(): Boolean ;
  declare function getEnd(): Vector ;
  declare function getDirection(): Vector ;
  declare function getLength(): Number ;
  declare function getCircularCenter(): Vector ;
  declare function getCircularStartRadius(): Number ;
  declare function getCircularRadius(): Number ;
  declare function getCircularSweep(): Number ;
  declare function getCircularChordLength(): Number ;
  declare function isClockwise(): Boolean ;
  declare function isFullCircle(): Boolean ;
  declare function isHelical(): Boolean ;
  declare function isSpiral(): Boolean ;
  declare function getCircularNormal(): Vector ;
  declare function getCircularPlane(): Integer ;
  declare function getHelicalOffset(): Vector ;
  declare function getHelicalDistance(): Number ;
  declare function getHelicalPitch(): Number ;
  declare function canLinearize(): Boolean ;
  declare function linearize(tolerance: Number);
  declare function getNumberOfSegments(tolerance: Number): Integer ;
  declare function getPositionU(u: Number): Vector ;
  declare function getCircularMotion(): CircularMotion ;
  declare function getFeedrate(): Number ;
  declare function getMovement(): Integer ;
  declare function getPower(): Boolean ;
  declare function getSpindleSpeed(): Number ;
  declare function getRadiusCompensation(): Integer ;
  declare function getCompensationOffset(): Integer ;
  declare function hasPreviousRecord(): Boolean ;
  declare function getPreviousRecord(): Record ;
  declare function hasNextRecord(): Boolean ;
  declare function getNextRecord(): Record ;
  declare function getNextTool(number: Integer): Tool ;
  declare function setWriteInvocations(writeInvocations: Boolean);
  declare function setWriteStack(writeStack: Boolean);
  declare function isFirstCyclePoint(): Boolean ;
  declare function isLastCyclePoint(): Boolean ;
  declare function getCyclePointId(): Integer ;
  declare function getNumberOfCyclePoints(): Integer ;
  declare function getCyclePoint(index: Integer): Vector ;
  declare function onImpliedCommand(command: Integer);
  declare function hasGlobalParameter(name: String): Boolean ;
  declare function getGlobalParameter(name: String): Value ;
  declare function hasParameter(name: String): Boolean ;
  declare function getParameter(name: String): Value ;
  declare function registerTerminationHandler(func: Function);
  declare function toDeg(radians: Number): Number ;
  declare function toRad(degrees: Number): Number ;
  declare function parseSpatial(value: String): Number ;
  declare function getPlane(direction: Vector): Integer ;
  declare function getISOPlane(plane: Integer): Integer ;
  declare function range(first: Number, end: Number, step: Number): Array ;
  declare function interval(from: Number, to: Number): Array ;
  declare function flatten(array: Array): Array ;
  declare function getQuadrant(angle: Number): Integer ;
  declare function validate(expression: Value);
  declare function debug(message: String);
  declare function spatial(value: Number, unit: Integer): Number ;
  declare function getInverseTime(distance: Number, speed: Number): Number ;
  declare function cycleNotSupported();
  declare function isWorkpieceDefined(): Boolean ;
  declare function isTurning(): Boolean ;
  declare function isMilling(): Boolean ;
  declare function isJet(): Boolean ;
  declare function isFirstSection(): Boolean ;
  declare function isLastSection(): Boolean ;
  declare function onExpandedRapid(x: Number, y: Number, z: Number): Boolean ;
  declare function onExpandedLinear(x: Number, y: Number, z: Number, feed: Number): Boolean ;
  declare function createMachineConfiguration(specifiers: Map): MachineConfiguration ;
  declare function getMachineConfigurationAsText(machine: MachineConfiguration): String ;
  declare function createAxis(specifiers: Map): Axis ;
  declare function createFormat(specifiers: Map): FormatNumber ;
  declare function createVariable(specifiers: Map, format: Format): Variable ;
  declare function createIncrementalVariable(specifiers: Map, format: Format): IncrementalVariable ;
  declare function createReferenceVariable(specifiers: Map, format: Format): ReferenceVariable ;
  declare function createModal(specifiers: Map, format: Format): Modal ;
  declare function createModalGroup(specifiers: Map, groups: Array, format: Format): ModalGroup ;
  declare function repositionToCycleClearance(cycle: Map, x: Number, y: Number, z: Number);
  declare function expandCyclePoint(x: Number, y: Number, z: Number);
  declare function isWellKnownCycle(): Boolean ;
  declare function isProbingCycle(uri: String): Booelan ;
  declare function isSubSpindleCycle(uri: String): Booelan ;
  declare function isWellKnownCommand(command: Integer): Boolean ;
  declare function getCommandStringId(command: Integer): String ;
  declare function canIgnoreCommand(command: Integer): Boolean ;
  declare function onUnsupportedCommand(command: Integer);
  declare function onUnsupportedCoolant(coolant: Integer);
  declare function getCoolantName(coolant: Integer): String ;
  declare function getMaterialName(material: Integer): String ;
  declare function onMachine();
  declare function onOpen();
  declare function onCycle();
  declare function onCyclePoint(x: Number, y: Number, z: Number);
  declare function onCycleEnd();
  declare function onParameter(name: String, value: Value);
  declare function onPassThrough(value: Value);
  declare function onComment(comment: String);
  declare function onRapid(x: Number, y: Number, z: Number);
  declare function onLinear(x: Number, y: Number, z: Number, feed: Number);
  declare function onCircular(clockwise: Boolean, cx: Number, cy: Number, cz: Number, x: Number, y: Number, z: Number, feed: Number);
  declare function onRapid5D(x: Number, y: Number, z: Number, dx: Number, dy: Number, dz: Number);
  declare function onLinear5D(x: Number, y: Number, z: Number, dx: Number, dy: Number, dz: Number, feed: Number);
  declare function onRewindMachine(a: Number, b: Number, c: Number);
  declare function onMovement(movement: Integer);
  declare function onPower(power: Boolean);
  declare function onRadiusCompensation();
  declare function onToolCompensation(compensation: Integer);
  declare function onDwell(time: Number);
  declare function onSpindleSpeed(spindleSpeed: Number);
  declare function onCommand(command: Integer);
  declare function onOrientateSpindle(angle: Number);
  declare function onSectionEnd();
  declare function onClose(); 


interface Range {
  readonly Range();
  readonly Range(a: Number, b: Number);
  readonly isNonRange(): Boolean ;
  readonly getMinimum(): Number ;
  readonly getMaximum(): Number ;
  readonly getSpan(): Number ;
  readonly getMiddle(): Number ;
  readonly grow(offset: Number);
  readonly reduce(offset: Number);
  readonly translate(offset: Number);
  readonly expandTo(value: Number);
  readonly expandToRange(value: Range);
  readonly getU(value: Number): Number ;
  readonly isWithin(value: Number): Boolean ;
  readonly clamp(value: Number): Number ;
  readonly toString(): String ;
}

interface Record {
  readonly Record();
  readonly isValid(): Boolean ;
  readonly getId(): Integer ;
  readonly getType(): Integer ;
  readonly getCategories(): Integer ;
  readonly isMotion(): Boolean ;
  readonly isCycle(): Boolean ;
  readonly getCycleType(): String ;
  readonly isParameter(): Boolean ;
  readonly getParameterName(): String ;
  readonly getParameterValue(): Value ;
}

interface ReferenceVariable {
  readonly ReferenceVariable(specifiers: Map, format: Format);
  readonly format(value: Number, reference: Number): String ;
  readonly getPrefix(): Value ;
  readonly setPrefix(prefix: Value);
  readonly disable();  
}

interface Section {
    /** Returns the zero-based id of the section.*/
    readonly getId(): Integer;
    /** Returns the number of records in the section.*/
    readonly getNumberOfRecords(): Integer;
    /** Returns the specified record within the section. */
    getRecord(id: Integer): Record;
    /** Returns the job id of the section. */
    readonly getJobId(): Integer;
    /** Returns the pattern id of the section. You can use this to tell which sections are pattern instances of the same original section. The motion coordinates will be identical for patterned sections but the work plane can be different. Note that, the pattern ids can be different for some types of patterns when the actual motion coordinates are mapped. 
    *By default the work origins are mapped to the WCS origin to simplify the post customization. This results in a displacement between the pattern instances. You can get the displacement by subtracting the initial section positions.
    *0 means that the section is not patterned. */
    readonly getPatternId(): Integer;
    /** Returns the number of pattern instances for the section.  */
    readonly getNumberOfPatternInstances(): Integer;
    /** Returns true if the section is patterned. Ie. at least one other section shares the same pattern id. */
    readonly isPatterned(): boolean;
    /** Returns true if the section uses axis substitution. In axis substitution mode the coordinates are the following meaning: "X: The offset along the substitution axis. Y: The rotation angle in radians. Z: Radius (always positive)" */
    readonly getChannel(): Integer;
    /** Returns true if tool change should be forced. */
    readonly getForceToolChange(): boolean;
    /** Returns true if the section is optional. */
    readonly isOptional(): boolean;
    /** Returns the first active compensation for the section. */
    readonly getFirstCompensationOffset(): Integer;
    /** Returns the tool. */
    readonly getTool(): Tool;
    /** Returns the content flags. */
    readonly getContent(): Integer;
    /** Returns true is the section contains multi-axis toolpath. */
    readonly isMultiAxis(): boolean;
    /** Returns the original unit of the section. 
    *This may be different from the output unit. 
    *The available values are: 
    *•IN - Inches 
    *•MM - Millimeters 
    */
    readonly getUnit(): Integer;
    /** Returns the type of the section.
    * The available types are:
    * •TYPE_MILLING
    * •TYPE_TURNING
    * •TYPE_WIRE
    * •TYPE_JET 
    */
    readonly getType(): Integer;
    /** Returns the associated quality. Used for waterjet, laser, and plasma cutting. */
    readonly getQuality(): Integer;
    /** Returns the type of waterjet, laser, and plasma cutting of the section.
    * The available modes are:
    * •JET_MODE_THROUGH
    * •JET_MODE_ETCHING
    * •JET_MODE_VAPORIZE 
     */
    readonly getJetMode(): Integer;
    /** Returns true if tailstock is active for turning. */
    readonly getTailstock(): boolean;
    /** Returns true if part catcher should be activated if available for turning. */
    readonly getPartCatcher(): boolean;
    /** Returns the active spindle.
    * The available values are:
    * •SPINDLE_PRIMARY - The main/primary spindle.
    * •SPINDLE_SECONDARY - The sub-spindle/secondary spindle. 
     */
    readonly getSpindle(): Integer;
    /** Returns the feed mode.
    * The available modes are:
    * •FEED_PER_MINUTE
    * •FEED_PER_REVOLUTION
    */
    readonly getFeedMode(): Integer;
    /** Returns the turning tool orientation (radians). */
    readonly getToolOrientation(): number;
    /** Returns the work origin in the WCS. */
    readonly getWorkOrigin(): Vector;

    readonly getWorkPlane(): Matrix;

    readonly isXOriented(): boolean;

    readonly isYOriented(): boolean;

    readonly isZOriented(): boolean;

    readonly isTopWorkPlane(): boolean;

    readonly getGlobalWorkOrigin(): Vector;
    /** */
    readonly getGlobalWorkPlane(): Matrix;
    /** */
    readonly getToolAxis(): integer;
    /** */
    readonly getWCSOrigin(): Vector;
    /** */
    readonly getWCSPlane(): Matrix;
    /** */
    readonly getDynamicWCSOrigin(): Vector;
    readonly getDynamicWCSPlane(): Matrix;
    readonly getFCSOrigin(): Vector;
    readonly getFCSPlane(): Matrix;
    readonly getWorkOffset(): Integer;
    readonly hasDynamicWorkOffset(): boolean;
    readonly getDynamicWorkOffset(): Integer;
    readonly getAxisSubstitution(): boolean;
    readonly getAxisSubstitutionRadius(): number;
    readonly getGlobalPosition(p: Vector): Vector;
    readonly getWCSPosition(p: Vector): Vector;
    readonly getSectionPosition(p: Vector): Vector;
    readonly getMaximumSpindleSpeed(): number;
    readonly getMaximumFeedrate(): number;
    readonly getCuttingDistance(): number;
    readonly getRapidDistance(): number;
    readonly getMovements(): Integer;
    readonly getCycleTime(): number;
    readonly getNumberOfCyclePoints(): Integer;
    readonly getZRange(): Range ;
    readonly getGlobalZRange(): Range;
    readonly getGlobalRange(direction: Vector): Range;
    readonly getBoundingBox(): BoundingBox;
    readonly getGlobalBoundingBox(): BoundingBox;
    readonly isCuttingMotionAwayFromRotary(distance: number, tolerance: number): boolean;
    readonly hasWellDefinedPosition(): boolean;
    readonly getFirstPosition(): Vector;
    readonly getInitialPosition(): Vector;
    readonly getFinalPosition(): Vector;
    readonly getInitialToolAxis(): Vector;
    readonly getGlobalInitialToolAxis(): Vector;
    readonly getInitialToolAxisABC(): Vector;
    readonly getFinalToolAxis(): Vector;
    readonly getFinalToolAxisABC(): Vector;
    readonly getGlobalFinalToolAxis(): Vector;
    readonly getInitialSpindleOn(): boolean;
    readonly getInitialSpindleSpeed(): number;
    readonly getMaximumTilt(): number;
    readonly getLowerToolAxisABC(): Vector;
    readonly getUpperToolAxisABC(): Vector;
    readonly isOptimizedForMachine(): boolean;
    readonly getOptimizedTCPMode(): Integer;
    readonly hasParameter(name: String): boolean;
    readonly getParameter(name: String): Value;
    readonly hasCycle(uri: String): boolean;
    readonly hasAnyCycle(): boolean;
    readonly getNumberOfCyclesWithId(uri: String): Integer;
    readonly getNumberOfCycles(): Integer;
    readonly getCycleId(index: Integer): String;
    readonly getFirstCycle(): String;
    readonly doesStartWithCycle(uri: String): boolean;
    readonly doesStartWithCycleIgnoringPositioning(uri: String): boolean;
    readonly doesStrictCycle(uri: String): boolean;
    readonly hasCycleParameter(index: Integer, name: String): boolean;
    readonly getCycleParameter(index: Integer, name: String): value;
    readonly optimizeMachineAnglesByMachine(machine: MachineConfiguration, tcp: Integer);   
}
/** An intrinsic object that provides basic mathematics functionality and constants. */

interface SMTP {
  readonly SMTP(_hostname: String, _port: short);
  readonly send(mail: Mail);
}


interface StringBuffer {
  readonly StringBuffer();
  readonly clear();
  readonly isEmpty(): Boolean ;
  readonly append(text: String);
  readonly assign(text: String);
  readonly toString(): String ;  
}

interface StringSubstitution {
  readonly StringSubstitution();
  readonly setValue(name: String, value: String);
  readonly substitute(text: String): String ;  
}

interface Table {
  readonly Table(values: Array, specifiers: Map);
  readonly lookup(index: Integer): Value ;
  readonly reset();  
}

interface Template {
  readonly Template(text: String);
  readonly substitute(map: Map): String ;
}

interface TextFile {
  readonly TextFile(path: String, write: Boolean, encoding: String);
  readonly isOpen(): Boolean ;
  readonly readln(): String ;
  readonly write(text: String);
  readonly writeln(text: String);
  readonly close();
}

interface ToolRenderer {
  readonly ToolRenderer();
  readonly setSegment(segment: Integer);
  readonly setBackgroundColor(color: Color);
  readonly setFluteColor(color: Color);
  readonly setShoulderColor(color: Color);
  readonly setShaftColor(color: Color);
  readonly setHolderColor(color: Color);
  readonly exportAs(path: String, mimetype: String, tool: Tool, width: Number, height: Number);
  readonly getAsBinary(mimetype: String, tool: Tool, width: Number, height: Number): String ;
}

interface ToolTable {
  readonly getNumberOfTools(): Integer ;
  readonly getTool(index: Integer): Tool ;
}

interface VectorPair {
  readonly first: Vector ;
  readonly second: Vector ;
}

interface XMLHttpRequest {
  readonly XMLHttpRequest();
  readonly open(method: String, url: String, async: Boolean, user: String, password: String);
  readonly abort();
  readonly setRequestHeader(name: String, value: String);
  readonly send(data: String);
  readonly getResponseHeader(name: String): String ;
}

interface ZipFile {
  readonly unzipTo(src: String, dest: String): static ;
  readonly zipTo(src: String, dest: String): static ;  
}

/** returns the spindle axis */
declare const spindleAxis: Integer;
declare const feedrate: Number;
declare const spindleSpeed: Number;
declare const machineConfiguration: MachineConfiguration;
declare const cycleType: String;
declare const cycleExpanded: Boolean;
declare const tool: Tool;
declare const currentSection: Section;
declare const SMTP:SMTP;

declare const outputUnit
declare const currentSection
declare const highFeedMapping
declare const highFeedrate
declare const lineNumber
declare const initialCyclePosition
declare const abortOnDeprecation
declare const end
declare const length
declare const center
declare const normal
declare const plane
declare const radius
declare const sweep
declare const clockwise
declare const chordLength
declare const fullCircle
declare const helical
/*The helical offset for the current circular motion.*/
declare const helicalOffset
declare const helicalDistance
declare const movement
declare const radiusCompensation
declare const description
declare const vendor
declare const vendorUrl
declare const legal
declare const unit
declare const programName
declare const programNameIsInteger
declare const debugMode
declare const preventPost
declare const filename
declare const extension
declare const version
declare const certificationLevel
declare const revision
declare const minimumRevision
declare const deprecated
declare const capabilities
declare const tolerance
declare const mapWorkOrigin
declare const mapToWCS
declare const allowMachineChangeOnSection
declare const minimumChordLength
declare const minimumCircularRadius
declare const maximumCircularRadius
declare const minimumCircularSweep
declare const maximumCircularSweep
declare const allowHelicalMoves
declare const allowSpiralMoves
declare const allowedCircularPlanes
declare const machineParameters
declare const properties
declare const NUL
/*SOH ASCII control code.*/
declare const SOH
/*STX ASCII control code.*/
declare const STX
/*ETX ASCII control code.*/
declare const ETX
/*EOT ASCII control code.*/
declare const EOT

/*ENQ ASCII control code.*/
declare const ENQ

/*ACK ASCII control code.*/
declare const ACK

/*BEL ASCII control code.*/
declare const BEL

/*BS ASCII control code.*/
declare const BS

/*TAB ASCII control code.*/
declare const TAB

/*LF ASCII control code.*/
declare const LF

/*VT ASCII control code.*/
declare const VT

/*FF ASCII control code.*/
declare const FF

/*CR ASCII control code.*/
declare const CR

/*SO ASCII control code.*/
declare const SO

/*SI ASCII control code.*/
declare const SI

/*DLE ASCII control code.*/
declare const DLE

/*DC1 ASCII control code.*/
declare const DC1

/*DC2 ASCII control code.*/
declare const DC2

/*DC3 ASCII control code.*/
declare const DC3

/*DC4 ASCII control code.*/
declare const DC4

/*NAK ASCII control code.*/
declare const NAK

/*SYN ASCII control code.*/
declare const SYN

/*ETB ASCII control code.*/
declare const ETB

/*CAN ASCII control code.*/
declare const CAN

/*EM ASCII control code.*/
declare const EM

/*SUB ASCII control code.*/
declare const SUB

/*ESC ASCII control code.*/
declare const ESC

/*FS ASCII control code.*/
declare const FS

/*GS ASCII control code.*/
declare const GS

/*RS ASCII control code.*/
declare const RS

/*US ASCII control code.*/
declare const US

/*The default end-of-line marker.*/
declare const EOL

/*Space string.*/
declare const SP

/*File path separator.*/
declare const PATH_SEPARATOR

/*Inch unit.*/
declare const IN

/*Millimeters unit.*/
declare const MM

/*Circular XY plane.*/
declare const PLANE_XY

/*Circular XZ plane. Deprecated use PLANE_ZX instead.*/
declare const PLANE_XZ

/*Circular ZX plane.*/
declare const PLANE_ZX

/*Circular YZ plane.*/
declare const PLANE_YZ

/*X coordinate index.*/
declare const X

/*Y coordinate index.*/
declare const Y

/*Z coordinate index.*/
declare const Z

/*YZ-plane.*/
declare const TOOL_AXIS_X

/*ZX-plane.*/
declare const TOOL_AXIS_Y

/*XY-plane.*/
declare const TOOL_AXIS_Z

/*Center radius compensation.*/
declare const RADIUS_COMPENSATION_OFF

/*Left radius compensation.*/
declare const RADIUS_COMPENSATION_LEFT

/*Right radius compensation.*/
declare const RADIUS_COMPENSATION_RIGHT

/*Don't linearize moves around multi-axis singularities. More...*/
declare const SINGULARITY_LINEARIZE_OFF

/*Keep top of tool in line with tool axis during multi-axis singularity linearization. More...*/
declare const SINGULARITY_LINEARIZE_LINEAR

/*Keep rotary axes in line during multi-axis singularity linearization. More...*/
declare const SINGULARITY_LINEARIZE_ROTARY

/*Coolant disabled.*/
declare const COOLANT_DISABLED

/*Flood coolant mode.*/
declare const COOLANT_FLOOD

/*Mist coolant mode.*/
declare const COOLANT_MIST

/*Coolant through tool mode. Deprecated use COOLANT_THROUGH_TOOL instead.*/
declare const COOLANT_TOOL

/*Coolant through tool mode.*/
declare const COOLANT_THROUGH_TOOL

/*Air mode.*/
declare const COOLANT_AIR

/*Air through tool mode.*/
declare const COOLANT_AIR_THROUGH_TOOL

/*Suction mode.*/
declare const COOLANT_SUCTION

/*Flood and mist coolant mode.*/
declare const COOLANT_FLOOD_MIST

/*Flood and through tool coolant mode.*/
declare const COOLANT_FLOOD_THROUGH_TOOL

/*Unspecified material.*/
declare const MATERIAL_UNSPECIFIED

/*High-speed steel material.*/
declare const MATERIAL_HSS

/*TI coated material.*/
declare const MATERIAL_TI_COATED

/*Carbide material.*/
declare const MATERIAL_CARBIDE

/*Ceramics material.*/
declare const MATERIAL_CERAMICS

/*Unspecified tool.*/
declare const TOOL_UNSPECIFIED

/*Drill.*/
declare const TOOL_DRILL

/*Center drill.*/
declare const TOOL_DRILL_CENTER

/*Spot drill.*/
declare const TOOL_DRILL_SPOT

/*Block drill.*/
declare const TOOL_DRILL_BLOCK

/*Flat end-mill.*/
declare const TOOL_MILLING_END_FLAT

/*Ball end-mill.*/
declare const TOOL_MILLING_END_BALL

/*Bullnose mill.*/
declare const TOOL_MILLING_END_BULLNOSE

/*Chamfer mill.*/
declare const TOOL_MILLING_CHAMFER

/*Face mill.*/
declare const TOOL_MILLING_FACE

/*Slot mill.*/
declare const TOOL_MILLING_SLOT

/*Radius mill.*/
declare const TOOL_MILLING_RADIUS

/*Dovetail mill.*/
declare const TOOL_MILLING_DOVETAIL

/*Tapered mill.*/
declare const TOOL_MILLING_TAPERED

/*Lollipop mill.*/
declare const TOOL_MILLING_LOLLIPOP

/*Right tap tool.*/
declare const TOOL_TAP_RIGHT_HAND

/*Left tap tool.*/
declare const TOOL_TAP_LEFT_HAND

/*Reamer tool.*/
declare const TOOL_REAMER

/*Boring bar tool.*/
declare const TOOL_BORING_BAR

/*Counterbore tool.*/
declare const TOOL_COUNTER_BORE

/*Countersink tool.*/
declare const TOOL_COUNTER_SINK

/*Holder.*/
declare const TOOL_HOLDER_ONLY

/*General turning tool.*/
declare const TOOL_TURNING_GENERAL

/*Thread turning tool.*/
declare const TOOL_TURNING_THREADING

/*Groove turning tool.*/
declare const TOOL_TURNING_GROOVING

/*Boring turning tool.*/
declare const TOOL_TURNING_BORING

/*Custom turning tool.*/
declare const TOOL_TURNING_CUSTOM

/*Probe.*/
declare const TOOL_PROBE

/*Wire.*/
declare const TOOL_WIRE

/*Water jet.*/
declare const TOOL_WATER_JET

/*Laser cutter.*/
declare const TOOL_LASER_CUTTER

/*Welder.*/
declare const TOOL_WELDER

/*Grinder.*/
declare const TOOL_GRINDER

/*Form mill.*/
declare const TOOL_MILLING_FORM

/*Plasma cutter.*/
declare const TOOL_PLASMA_CUTTER

/*Marker tool.*/
declare const TOOL_MARKER

/*Thread mill.*/
declare const TOOL_MILLING_THREAD

/*Turning tool compensation.*/
declare const TOOL_COMPENSATION_INSERT_CENTER

/*Turning tool compensation.*/
declare const TOOL_COMPENSATION_TIP

/*Turning tool compensation.*/
declare const TOOL_COMPENSATION_TIP_CENTER

/*Turning tool compensation.*/
declare const TOOL_COMPENSATION_TIP_TANGENT

/*Has parameter flag.*/
declare const HAS_PARAMETER

/*Has rapid flag.*/
declare const HAS_RAPID

/*Has linear flag.*/
declare const HAS_LINEAR

/*Has dwell flag.*/
declare const HAS_DWELL

/*Has circular flag.*/
declare const HAS_CIRCULAR

/*Has cycle flag.*/
declare const HAS_CYCLE

/*Has well-known command flag.*/
declare const HAS_WELL_KNOWN_COMMAND

/*Has comment flag.*/
declare const HAS_COMMENT

/*Invalid record type.*/
declare const RECORD_INVALID

/*Well-known command.*/
declare const RECORD_WELL_KNOWN_COMMAND

/*Parameter.*/
declare const RECORD_PARAMETER

/*Linear motion.*/
declare const RECORD_LINEAR

/*Linear 5-axis motion.*/
declare const RECORD_LINEAR_5D

/*Linear 5-axis motion.*/
declare const RECORD_LINEAR_ZXN

/*Circular motion.*/
declare const RECORD_CIRCULAR

/*Dwell.*/
declare const RECORD_DWELL

/*Cycle.*/
declare const RECORD_CYCLE

/*End of cycle.*/
declare const RECORD_CYCLE_OFF

/*Comment.*/
declare const RECORD_COMMENT

/*Comment.*/
declare const RECORD_WIDE_COMMENT

/*Invalid (well-known command).*/
declare const COMMAND_INVALID

/*Program stop (well-known command M00).*/
declare const COMMAND_STOP

/*Optional program stop (well-known command M01).*/
declare const COMMAND_OPTIONAL_STOP

/*Program end (well-known command M02).*/
declare const COMMAND_END

/*Clockwise spindle direction (well-known command M03).*/
declare const COMMAND_SPINDLE_CLOCKWISE

/*Counterclockwise spidle direction (well-known command M04).*/
declare const COMMAND_SPINDLE_COUNTERCLOCKWISE

/*Spindle start (well-known command M03 or M04). This is a virtual command which maps to either COMMAND_SPINDLE_CLOCKWISE or COMMAND_SPINDLE_COUNTERCLOCKWISE dependent on the current spindle direction.*/
declare const COMMAND_START_SPINDLE

/*Spindle stop (well-known command M05).*/
declare const COMMAND_STOP_SPINDLE

/*Orientate spindle direction (well-known command M19). The property 'machineParameters.spindleOrientation' must be set to the machine spindle orientation.*/
declare const COMMAND_ORIENTATE_SPINDLE

/*Tool change (M06).*/
declare const COMMAND_LOAD_TOOL

/*Coolant on (M08).*/
declare const COMMAND_COOLANT_ON

/*Coolant off (M09).*/
declare const COMMAND_COOLANT_OFF

/*Activate speed-feed synchronization (well-known command).*/
declare const COMMAND_ACTIVATE_SPEED_FEED_SYNCHRONIZATION

/*Deactivate speed-feed synchronization (well-known command).*/
declare const COMMAND_DEACTIVATE_SPEED_FEED_SYNCHRONIZATION

/*Locks the 4th and 5th axes. This command is optional.*/
declare const COMMAND_LOCK_MULTI_AXIS

/*Unlocks the 4th and 5th axes. This command is optional.*/
declare const COMMAND_UNLOCK_MULTI_AXIS

/*Exact stop. This command is optional.*/
declare const COMMAND_EXACT_STOP

/*Close chip transport.*/
declare const COMMAND_START_CHIP_TRANSPORT

/*Stop chip transport.*/
declare const COMMAND_STOP_CHIP_TRANSPORT

/*Open primary door.*/
declare const COMMAND_OPEN_DOOR

/*Close primary door.*/
declare const COMMAND_CLOSE_DOOR

/*Break control.*/
declare const COMMAND_BREAK_CONTROL

/*Measure tool.*/
declare const COMMAND_TOOL_MEASURE

/*Run calibration cycle.*/
declare const COMMAND_CALIBRATE

/*Verify part/tool/machine integrity.*/
declare const COMMAND_VERIFY

/*Run cleaning cycle.*/
declare const COMMAND_CLEAN

/*Alarm.*/
declare const COMMAND_ALARM

/*Alert.*/
declare const COMMAND_ALERT

/*Change pallet.*/
declare const COMMAND_CHANGE_PALLET

/*Power on.*/
declare const COMMAND_POWER_ON

/*Power off.*/
declare const COMMAND_POWER_OFF

/*Open main chuck. More...*/
declare const COMMAND_MAIN_CHUCK_OPEN

/*Close main chuck. More...*/
declare const COMMAND_MAIN_CHUCK_CLOSE

/*Open secondary chuck. More...*/
declare const COMMAND_SECONDARY_CHUCK_OPEN

/*Close secondary chuck. More...*/
declare const COMMAND_SECONDARY_CHUCK_CLOSE

/*Activate spindle synchronization. More...*/
declare const COMMAND_SECONDARY_SPINDLE_SYNCHRONIZATION_ACTIVATE

/*Deactivate spindle synchronization. More...*/
declare const COMMAND_SECONDARY_SPINDLE_SYNCHRONIZATION_DEACTIVATE

/*Sync channels.*/
declare const COMMAND_SYNC_CHANNELS

/*Probe on.*/
declare const COMMAND_PROBE_ON

/*Probe off.*/
declare const COMMAND_PROBE_OFF

/*Rapid movement type.*/
declare const MOVEMENT_RAPID

/*Lead-in movement type.*/
declare const MOVEMENT_LEAD_IN

/*Cutting movement type.*/
declare const MOVEMENT_CUTTING

/*Lead-out movement type.*/
declare const MOVEMENT_LEAD_OUT

/*Transition linking movement type.*/
declare const MOVEMENT_LINK_TRANSITION

/*Direction linking movement type.*/
declare const MOVEMENT_LINK_DIRECT

/*Helical ramp movement type.*/
declare const MOVEMENT_RAMP_HELIX

/*Profile ramp movement type.*/
declare const MOVEMENT_RAMP_PROFILE

/*Zig-zag ramp movement type.*/
declare const MOVEMENT_RAMP_ZIG_ZAG

/*Ramp movement type.*/
declare const MOVEMENT_RAMP

/*Plunge movement type.*/
declare const MOVEMENT_PLUNGE

/*Predrill movement type.*/
declare const MOVEMENT_PREDRILL

/*Extended movement type.*/
declare const MOVEMENT_EXTENDED

/*Reduced cutting feed movement type.*/
declare const MOVEMENT_REDUCED

/*Finish cutting movement type.*/
declare const MOVEMENT_FINISH_CUTTING

/*High feed movement type.*/
declare const MOVEMENT_HIGH_FEED

/*Do not map rapid travesal to high feed.*/
declare const HIGH_FEED_NO_MAPPING

/*Map rapid travesal along more than one axis to high feed.*/
declare const HIGH_FEED_MAP_MULTI

/*Map rapid travesal not in the X-Y plane or along the Z-axis to high feed.*/
declare const HIGH_FEED_MAP_XY_Z

/*Map all rapid travesals to high feed.*/
declare const HIGH_FEED_MAP_ANY

