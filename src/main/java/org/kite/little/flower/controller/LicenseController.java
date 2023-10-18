package org.kite.little.flower.controller;

import org.kite.little.flower.utils.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * LicenseController
 *
 * @author fengzheng
 * @date 2019/9/28
 */
@RestController
@RequestMapping(value = "license")
public class LicenseController {

    private List<String> codes = new ArrayList<>(Arrays.asList("687908","302889","965371","220130"));


    @GetMapping(value = "isAllowed")
    public Result<Boolean> isAllowed(String licenseCode){

        return Result.success(codes.contains(licenseCode));
    }

    @PostMapping(value = "submit")
    public Result<Boolean> submit(){

        return Result.success(true);
    }
}
